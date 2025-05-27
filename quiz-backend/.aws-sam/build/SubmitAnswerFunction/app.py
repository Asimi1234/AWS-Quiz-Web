import json

correct_answers = {
    "q1": "Portuguese",
    "q2": "English",
    "q3": "South",
    "q4": "50",
    "q5": "Yoruba",
    "q6": "Divinities",
    "q7": "Society and culture",
    "q8": "Absolution",
    "q9": "Ghana",
    "q10": "Obatala",
    "q11": "Determinism",
    "q12": "1939",
    "q13": "Fulani",
    "q14": "Hiroshima",
    "q15": "Patricia Etteh",
    "q16": "Convivial",
    "q17": "Anthony Enahoro",
    "q18": "201",
    "q19": "Bill Clinton",
    "q20": "Obafemi Awolowo",
    "q21": "153 million",
    "q22": "Attitude and Behavior",
    "q23": "1914",
    "q24": "Discipline",
    "q25": "Ethics and Discipline",
    "q26": "Ethics",
    "q27": "Ethics",
    "q28": "Ethics",
    "q29": "Norms",
    "q30": "The Bill of Right",
    "q31": "Value",
    "q32": "Folkways",
    "q33": "Values",
    "q34": "Culturally Specific",
    "q35": "Gesture",
    "q36": "Patriotism",
    "q37": "Values",
    "q38": "Morality",
    "q39": "Morality",
    "q40": "Re-orientation",
    "q41": "Crime",
    "q42": "Cultism",
    "q43": "Materialism",
    "q44": "Moral Problems",
    "q45": "Nation",
    "q46": "52",
    "q47": "5",
    "q48": "Divinities",
    "q49": "Reincarnation",
    "q50": "Magic"
}

def lambda_handler(event, context):
    try:
        print("EVENT:", event)
        body = json.loads(event.get("body", "{}"))
        question_id = body.get("question_id")
        answer = body.get("answer")

        is_correct = correct_answers.get(question_id, "").strip().lower() == answer.strip().lower()

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            "body": json.dumps({"correct": is_correct})
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }
