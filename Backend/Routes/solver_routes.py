from flask import Blueprint, jsonify, request
import json
from ortools.sat.python import cp_model

# Define the Blueprint
solver_bp = Blueprint('solver', __name__)

# Constants
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
SLOTS_PER_DAY = 9
LUNCH_BREAK_SLOTS = [5]  # Only slot 5 (01:00 PM - 01:40 PM)
LECTURES_PER_DAY = 4  # Enforce exactly 4 lectures per day per batch
TIME_SLOTS = [
    "08:50-09:40", "09:40-10:30", "10:30-11:20", "11:20-12:10", "12:10-01:00",
    "01:00-01:40",  # LUNCH BREAK
    "01:40-02:30", "02:30-03:20", "03:20-04:10"
]

def load_schema(path):
    """Load the timetable schema JSON."""
    with open(path, "r") as f:
        return json.load(f)

def solve_timetable(schema, fixed_positions=None):
    """
    Solve timetable using Google OR-Tools CP-SAT.
    Returns frontend-ready timetable grid with proper display format using day names and time slots.
    Enforces exactly 4 lectures per day per batch.
    """
    try:
        print("=== SOLVER DEBUG: Starting solver ===")
        model = cp_model.CpModel()
        divisions = schema["divisions"]
        subjects = schema["subjects"]
        faculty = schema["faculty"]
        rooms = schema["rooms"]
        print(f"Solver input: {len(divisions)} divisions, {len(subjects)} subjects, {len(faculty)} faculty, {len(rooms)} rooms")

        # Separate subjects into lectures and labs
        lecture_subjects = [s for s in subjects if s['type'] == 'Theory']
        lab_subjects = [s for s in subjects if s['type'] == 'Lab']

        print(f"Subject breakdown: {len(lecture_subjects)} lectures, {len(lab_subjects)} labs")

        # Create index maps
        lecture_index_map = {subj["code"]: idx for idx, subj in enumerate(lecture_subjects)}
        lab_index_map = {subj["code"]: idx for idx, subj in enumerate(lab_subjects)}

        # Variables for lectures: timetable_lecture[(day, slot, division)] = lecture_subject_index (-1 means free)
        timetable_lecture = {}
        for d in range(len(DAYS)):
            for s in range(SLOTS_PER_DAY):
                for div in divisions:
                    timetable_lecture[(d, s, div["name"])] = model.NewIntVar(
                        -1, max(0, len(lecture_subjects) - 1),
                        f"lec_{d}{s}{div['name']}"
                    )

        # Variables for labs: timetable_lab[(day, slot, division, batch)] = lab_subject_index (-1 means free)
        timetable_lab = {}
        for d in range(len(DAYS)):
            for s in range(SLOTS_PER_DAY):
                for div in divisions:
                    for batch in div["batches"]:
                        timetable_lab[(d, s, div["name"], batch)] = model.NewIntVar(
                            -1, max(0, len(lab_subjects) - 1),
                            f"lab_{d}{s}{div['name']}_{batch}"
                        )

        print("=== SOLVER DEBUG: Variables created ===")

        # Constraint: No classes during lunch break (only slot 5 now)
        for d in range(len(DAYS)):
            for s in LUNCH_BREAK_SLOTS:
                for div in divisions:
                    model.Add(timetable_lecture[(d, s, div["name"])] == -1)
                    for batch in div["batches"]:
                        model.Add(timetable_lab[(d, s, div["name"], batch)] == -1)

        # Apply fixed positions if provided
        if fixed_positions:
            print(f"Applying {len(fixed_positions)} fixed positions")
            for (div_name, batch_name, d, s), subj_code in fixed_positions.items():
                if subj_code in lecture_index_map:
                    model.Add(timetable_lecture[(d, s, div_name)] == lecture_index_map[subj_code])
                elif subj_code in lab_index_map and batch_name:
                    model.Add(timetable_lab[(d, s, div_name, batch_name)] == lab_index_map[subj_code])

        # Constraint: A division cannot have a lecture and a lab at the same time for the same slot
        for d in range(len(DAYS)):
            for s in range(SLOTS_PER_DAY):
                if s in LUNCH_BREAK_SLOTS:
                    continue
                for div in divisions:
                    # For each batch, ensure no conflict between division lecture and batch lab
                    for batch in div["batches"]:
                        is_lecture = model.NewBoolVar(f"is_lec_{d}{s}{div['name']}")
                        is_lab = model.NewBoolVar(f"is_lab_{d}{s}{div['name']}_{batch}")

                        model.Add(timetable_lecture[(d, s, div["name"])] >= 0).OnlyEnforceIf(is_lecture)
                        model.Add(timetable_lecture[(d, s, div["name"])] == -1).OnlyEnforceIf(is_lecture.Not())

                        model.Add(timetable_lab[(d, s, div["name"], batch)] >= 0).OnlyEnforceIf(is_lab)
                        model.Add(timetable_lab[(d, s, div["name"], batch)] == -1).OnlyEnforceIf(is_lab.Not())

                        # At most one can be scheduled
                        model.Add(is_lecture + is_lab <= 1)

        # Constraint: Exactly 4 lectures per day per batch
        print("Adding daily lecture count constraint (4 lectures per day per batch)...")
        for d in range(len(DAYS)):
            for div in divisions:
                for batch in div["batches"]:
                    daily_class_vars = []

                    # Count lectures (these apply to the whole division, so affect this batch)
                    for s in range(SLOTS_PER_DAY):
                        if s not in LUNCH_BREAK_SLOTS:
                            # Boolean variable for whether there's a lecture in this slot
                            has_lecture = model.NewBoolVar(f"has_lec_{d}{s}{div['name']}")
                            model.Add(timetable_lecture[(d, s, div["name"])] >= 0).OnlyEnforceIf(has_lecture)
                            model.Add(timetable_lecture[(d, s, div["name"])] == -1).OnlyEnforceIf(has_lecture.Not())
                            daily_class_vars.append(has_lecture)

                            # Boolean variable for whether there's a lab for this batch in this slot
                            has_lab = model.NewBoolVar(f"has_lab_{d}{s}{div['name']}_{batch}")
                            model.Add(timetable_lab[(d, s, div["name"], batch)] >= 0).OnlyEnforceIf(has_lab)
                            model.Add(timetable_lab[(d, s, div["name"], batch)] == -1).OnlyEnforceIf(has_lab.Not())
                            daily_class_vars.append(has_lab)

                    # Exactly 4 classes per day per batch
                    model.Add(sum(daily_class_vars) == LECTURES_PER_DAY)
                    print(f"Added constraint: Division {div['name']}, Batch {batch} must have exactly {LECTURES_PER_DAY} classes per day")

        # Lecture frequency constraints (min/max per week) - adjusted for new daily constraint
        if lecture_subjects:
            print("Adding lecture frequency constraints...")
            for subj_index, subj in enumerate(lecture_subjects):
                min_pw = max(1, subj.get("min_per_week", 1))
                max_pw = min(subj.get("max_per_week", 7), 7)

                vars_for_subj = []
                for d in range(len(DAYS)):
                    for s in range(SLOTS_PER_DAY):
                        if s not in LUNCH_BREAK_SLOTS:
                            for div in divisions:
                                bvar = model.NewBoolVar(f"lec_subj_{subj_index}{d}{s}_{div['name']}")
                                model.Add(timetable_lecture[(d, s, div["name"])] == subj_index).OnlyEnforceIf(bvar)
                                model.Add(timetable_lecture[(d, s, div["name"])] != subj_index).OnlyEnforceIf(bvar.Not())
                                vars_for_subj.append(bvar)

                if vars_for_subj:
                    model.Add(sum(vars_for_subj) >= min_pw)
                    model.Add(sum(vars_for_subj) <= max_pw)

        # Lab frequency constraints (simplified)
        if lab_subjects:
            print("Adding lab frequency constraints...")
            for subj_index, subj in enumerate(lab_subjects):
                min_pw = max(1, subj.get("min_per_week", 1))
                max_pw = min(subj.get("max_per_week", 5), 5)

                vars_for_subj = []
                for d in range(len(DAYS)):
                    for s in range(SLOTS_PER_DAY):
                        if s not in LUNCH_BREAK_SLOTS:
                            for div in divisions:
                                for batch in div["batches"]:
                                    # Only count if this batch is supposed to take this lab
                                    batch_names = subj.get("batches", [])
                                    if not batch_names or batch in batch_names:
                                        bvar = model.NewBoolVar(f"lab_subj_{subj_index}{d}{s}{div['name']}{batch}")
                                        model.Add(timetable_lab[(d, s, div["name"], batch)] == subj_index).OnlyEnforceIf(bvar)
                                        model.Add(timetable_lab[(d, s, div["name"], batch)] != subj_index).OnlyEnforceIf(bvar.Not())
                                        vars_for_subj.append(bvar)

                if vars_for_subj:
                    model.Add(sum(vars_for_subj) >= min_pw)
                    model.Add(sum(vars_for_subj) <= max_pw)

        # Enhanced faculty constraints
        print("Adding faculty constraints...")
        for fac in faculty:
            max_per_day = min(fac.get("max_per_day", 5), 7)
            max_per_week = min(fac.get("max_per_week", 25), 35)

            weekly_assignments = []

            for d in range(len(DAYS)):
                daily_assignments = []

                # Check lecture assignments
                for subj_index, subj in enumerate(lecture_subjects):
                    if fac["abbr"] in subj.get("faculty", []):
                        for div in divisions:
                            for s in range(SLOTS_PER_DAY):
                                if s not in LUNCH_BREAK_SLOTS:
                                    bvar = model.NewBoolVar(f"fac_{fac['abbr']}lec{d}{s}{div['name']}_{subj_index}")
                                    model.Add(timetable_lecture[(d, s, div["name"])] == subj_index).OnlyEnforceIf(bvar)
                                    model.Add(timetable_lecture[(d, s, div["name"])] != subj_index).OnlyEnforceIf(bvar.Not())
                                    daily_assignments.append(bvar)
                                    weekly_assignments.append(bvar)

                # Check lab assignments
                for subj_index, subj in enumerate(lab_subjects):
                    if fac["abbr"] in subj.get("faculty", []):
                        for div in divisions:
                            for batch in div["batches"]:
                                batch_names = subj.get("batches", [])
                                if not batch_names or batch in batch_names:
                                    for s in range(SLOTS_PER_DAY):
                                        if s not in LUNCH_BREAK_SLOTS:
                                            bvar = model.NewBoolVar(f"fac_{fac['abbr']}lab{d}{s}{div['name']}{batch}{subj_index}")
                                            model.Add(timetable_lab[(d, s, div["name"], batch)] == subj_index).OnlyEnforceIf(bvar)
                                            model.Add(timetable_lab[(d, s, div["name"], batch)] != subj_index).OnlyEnforceIf(bvar.Not())
                                            daily_assignments.append(bvar)
                                            weekly_assignments.append(bvar)

                # Faculty can't be in multiple places at once & daily limit
                if daily_assignments:
                    model.Add(sum(daily_assignments) <= max_per_day)

            # Weekly limit for faculty
            if weekly_assignments:
                model.Add(sum(weekly_assignments) <= max_per_week)

        # Room capacity and availability constraints
        print("Adding room constraints...")
        for room in rooms:
            room_name = room["name"]
            room_type = room["type"]

            for d in range(len(DAYS)):
                for s in range(SLOTS_PER_DAY):
                    if s not in LUNCH_BREAK_SLOTS:
                        room_assignments = []

                        # Check if any lectures use this room
                        for subj_index, subj in enumerate(lecture_subjects):
                            if subj.get("room_type") == room_type or subj.get("required_room") == room_name:
                                for div in divisions:
                                    bvar = model.NewBoolVar(f"room_{room_name}lec{d}{s}{div['name']}_{subj_index}")
                                    model.Add(timetable_lecture[(d, s, div["name"])] == subj_index).OnlyEnforceIf(bvar)
                                    model.Add(timetable_lecture[(d, s, div["name"])] != subj_index).OnlyEnforceIf(bvar.Not())
                                    room_assignments.append(bvar)

                        # Check if any labs use this room
                        for subj_index, subj in enumerate(lab_subjects):
                            if subj.get("room_type") == room_type or subj.get("required_room") == room_name:
                                for div in divisions:
                                    for batch in div["batches"]:
                                        batch_names = subj.get("batches", [])
                                        if not batch_names or batch in batch_names:
                                            bvar = model.NewBoolVar(f"room_{room_name}lab{d}{s}{div['name']}{batch}{subj_index}")
                                            model.Add(timetable_lab[(d, s, div["name"], batch)] == subj_index).OnlyEnforceIf(bvar)
                                            model.Add(timetable_lab[(d, s, div["name"], batch)] != subj_index).OnlyEnforceIf(bvar.Not())
                                            room_assignments.append(bvar)

                        # Room can only be used by one class at a time
                        if room_assignments:
                            model.Add(sum(room_assignments) <= 1)

        print("=== SOLVER DEBUG: All constraints added, starting solve ===")

        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 180
        solver.parameters.log_search_progress = True

        status = solver.Solve(model)

        print(f"Solver status: {status}")
        print(f"Solver statistics: {solver.ResponseStats()}")

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print("=== SOLVER DEBUG: Solution found, building output ===")

            output = {}
            for div in divisions:
                div_name = div["name"]
                output[div_name] = {"batches": {}}

                for batch in div["batches"]:
                    batch_schedule = {}

                    for d in range(len(DAY_NAMES)):
                        day_name = DAY_NAMES[d]
                        day_slots = []
                        daily_class_count = 0

                        for s in range(SLOTS_PER_DAY):
                            slot_content = "-"

                            if s in LUNCH_BREAK_SLOTS:
                                slot_content = "LUNCH BREAK"
                            else:
                                lec_index = solver.Value(timetable_lecture[(d, s, div_name)])
                                if lec_index >= 0 and lec_index < len(lecture_subjects):
                                    subj = lecture_subjects[lec_index]
                                    faculty_list = subj.get("faculty", [])
                                    faculty_str = faculty_list[0] if faculty_list else "TBA"
                                    slot_content = f"{subj['code']}\n{faculty_str}"
                                    daily_class_count += 1

                                elif batch:
                                    lab_index = solver.Value(timetable_lab[(d, s, div_name, batch)])
                                    if lab_index >= 0 and lab_index < len(lab_subjects):
                                        subj = lab_subjects[lab_index]
                                        batch_names = subj.get("batches", [])
                                        if not batch_names or batch in batch_names:
                                            faculty_list = subj.get("faculty", [])
                                            faculty_str = faculty_list[0] if faculty_list else "TBA"
                                            slot_content = f"{subj['code']}\n{faculty_str}"
                                            daily_class_count += 1

                            day_slots.append(slot_content)

                        print(f"Division {div_name}, Batch {batch}, {day_name}: {daily_class_count} classes scheduled")
                        batch_schedule[day_name] = day_slots

                    output[div_name]["batches"][batch] = batch_schedule

            print(f"=== SOLVER DEBUG: Output built for {len(output)} divisions ===")

            for div_name, div_data in output.items():
                print(f"Division {div_name}:")
                for batch_name, batch_data in div_data["batches"].items():
                    print(f"  Batch {batch_name}: {list(batch_data.keys())}")
                    for day, slots in batch_data.items():
                        class_slots = [i for i, slot in enumerate(slots) if slot not in ['-', 'LUNCH BREAK']]
                        print(f"    {day}: {len(class_slots)} classes in slots {class_slots}")
                        if len(class_slots) != LECTURES_PER_DAY:
                            print(f"    WARNING: Expected {LECTURES_PER_DAY} classes but got {len(class_slots)}")

            return output

        else:
            print(f"=== SOLVER DEBUG: No solution found, status: {status} ===")
            if status == cp_model.INFEASIBLE:
                print("Problem is INFEASIBLE - constraints are too restrictive")
            elif status == cp_model.UNKNOWN:
                print("Solver timed out or ran into issues")
            return None

    except Exception as e:
        print(f"=== SOLVER EXCEPTION: {str(e)} ===")
        import traceback
        print(traceback.format_exc())
        return None

@solver_bp.route('/generate', methods=['POST'])
def generate_timetable():
    """API endpoint to generate a timetable."""
    data = request.get_json()
    schema = data.get('schema')
    fixed_positions = data.get('fixed_positions', {})

    if not schema:
        return jsonify({"error": "Schema is required"}), 400

    timetable = solve_timetable(schema, fixed_positions)
    if timetable:
        return jsonify(timetable)
    else:
        return jsonify({"error": "Failed to generate timetable"}), 500

if __name__ == "__main__":
    # For testing this file directly
    schema = load_schema("schema.json")
    fixed_positions = {}
    timetable = solve_timetable(schema, fixed_positions=fixed_positions)
    if timetable:
        print(json.dumps(timetable, indent=2))
    else:
        print("Failed to generate timetable")
