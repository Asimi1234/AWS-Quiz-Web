import json

COURSE_ANSWERS = {
    "GST112" : {
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
    },
    "GET102" : {
        "q1": "stay",
    },
   "CHM102":
     {
        "q1": "one s-electron",
        "q2": "decreases",
        "q3": "Fertilizers and biochemical substrates",
        "q4": "Ba",
        "q5": "the first member",
        "q6": "+1",
        "q7": "two s-electron and two p-electron",
        "q8": "Sc3+",
        "q9": "if the nucleus is stable, it will disintegrate",
        "q10": "+2 to +6",
        "q11": "0.0625g",
        "q12": "3.87BM",
        "q13": "14N-7",
        "q14": "small atomic radii",
        "q15": "the oxidation state of the transition metal doesn’t determine the colour",
        "q16": "Friedrich Wöhler",
        "q17": "crystalline form",
        "q18": "the properties of organic compounds",
        "q19": "studying the composition of stars",
        "q20": "Carbon, hydrogen, oxygen",
        "q21": "Alkanes",
        "q22": "Imbalance in electron density",
        "q23": "RCOOH",
        "q24": "RCHO",
        "q25": "Butylamine",
        "q26": "C=O and -O-",
        "q27": "CH3C(CH3)OHCH2CH3",
        "q28": "but-2-ene",
        "q29": "ethanol and ethanoic acid",
        "q30": "Fractional distillation"
  }
}

def lambda_handler(event, context):
    try:
        print("EVENT:", event)
        body = json.loads(event.get("body", "{}"))

        course_id = body.get("courseId")
        question_id = body.get("question_id")
        user_answer = body.get("answer", "")

        if not course_id or course_id not in COURSE_ANSWERS:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid or missing courseId"})
            }

        correct_answers = COURSE_ANSWERS[course_id]
        correct_answer = correct_answers.get(question_id, "")

        is_correct = correct_answer.strip().lower() == user_answer.strip().lower()

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
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