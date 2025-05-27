import json
import random

def lambda_handler(event, context):
    questions = [
        {"questionId": "q1", "question": "Who were the first European to explore the West African coasts?", "options": ["Portuguese", "Spanish", "British", "French"]},
        {"questionId": "q2", "question": "Which language serves as the official language in Nigeria?", "options": ["English", "Yoruba", "Edo", "Hausa"]},
        {"questionId": "q3", "question": "In which part of Nigeria do Christians predominantly reside?", "options": ["South", "North", "East", "West"]},
        {"questionId": "q4", "question": "Africa is known to consist of how many nations around the South-Saharan desert?", "options": ["50", "20", "30", "40"]},
        {"questionId": "q5", "question": "Which ethnic group believes in the idea of partial reincarnation?", "options": ["Yoruba", "Igbo", "Edo", "Mende"]},
        {"questionId": "q6", "question": "_____ acts as the intermediaries between God and man.", "options": ["Divinities", "Ancestors", "Spirit", "Magic"]},
        {"questionId": "q7", "question": "Art is considered an integral and creative aspect of ______.", "options": ["Society and culture", "Tradition", "Religion", "Economic development"]},
        {"questionId": "q8", "question": "Which of the following is not a feature of democracy?", "options": ["Absolution", "Communicalism", "Rule of law", "All of the above"]},
        {"questionId": "q9", "question": "With reference to federal systems, which of the following is odd?", "options": ["Ghana", "Nigeria", "Brazil", "USA"]},
        {"questionId": "q10", "question": "The Yoruba mythology of creation claims that ____ created Ile-Ife, ancestral home of the Yoruba.", "options": ["Obatala", "Olodumare", "Esu", "Ajala"]},
        {"questionId": "q11", "question": "____ is simply the thesis that every event with respect to the past, present and future has a cause.", "options": ["Determinism", "Belief", "Fatalism", "Destiny"]},
        {"questionId": "q12", "question": "The Second World War started in what year?", "options": ["1939", "1922", "1876", "1956"]},
        {"questionId": "q13", "question": "Ngati-Koggi is associated with the ________ marriage system.", "options": ["Fulani", "Yoruba", "Igbo", "Ijaw"]},
        {"questionId": "q14", "question": "The first atomic bomb ever used in world history landed in _____", "options": ["Hiroshima", "Nagasaki", "Pearl Dabirii", "Patricia Etteh"]},
        {"questionId": "q15", "question": "Who is the first female Speaker of the House of Representatives in Nigeria?", "options": ["Patricia Etteh", "Afolashade Grace Bent", "Iyabo Obasanjo", "Mrs Abike Dabiri"]},
        {"questionId": "q16", "question": "_____ association among Yoruba provide an avenue for the ostentatious display of wealth.", "options": ["Convivial", "Religious", "Age-grade", "Credit"]},
        {"questionId": "q17", "question": "A motion demanding self-governance in Nigeria in the House of Representatives was sponsored by _______.", "options": ["Anthony Enahoro", "Chief Obafemi Awolowo", "Dr Nnamdi Azikiwe", "Tafawa Balewa"]},
        {"questionId": "q18", "question": "It is believed by the Yoruba that Esu has over ____ names.", "options": ["201", "1000", "400", "4000"]},
        {"questionId": "q19", "question": "_____ is the first American president to visit Nigeria.", "options": ["Bill Clinton", "George Washington", "Walker Bush", "Barack Obama"]},
        {"questionId": "q20", "question": "The leader of the Action Group political party was ______.", "options": ["Obafemi Awolowo", "Samuel Ladoke Akintola", "Earnest Shonekan", "Aguiyi Ironsi"]},
        {"questionId": "q21", "question": "What is the estimated population in Nigeria?", "options": ["153 million", "1.52 million", "1.5 billion", "400 million"]},
        {"questionId": "q22", "question": "Norms and important factors that define people are ____ and ____.", "options": ["Attitude and Behavior", "Attitude and Growth", "Behavior and Growth", "None of the above"]},
        {"questionId": "q23", "question": "Sir Fredrick Lugard was appointed to establish formal British control over Northern and Southern Nigeria in which year?", "options": ["1914", "1917", "1840", "1847"]},
        {"questionId": "q24", "question": "______ is a word that is derived from the Latin word 'Discipulus'", "options": ["Discipline", "Culture", "Belief", "None of the above"]},
        {"questionId": "q25", "question": "Individually, citizens are daily faced with issues of ____ and ____.", "options": ["Ethics and Discipline", "Value and Society", "Value and Mores", "All of the above"]},
        {"questionId": "q26", "question": "______ as a part of philosophy can be considered the art or science of good moral conduct.", "options": ["Ethics", "Value", "Future", "Norms"]},
        {"questionId": "q27", "question": "Echekwube (2005) defines ______ as the method of operation using logically and universally accepted standards.", "options": ["Ethics", "Value", "Future", "Norms"]},
        {"questionId": "q28", "question": "_______ is the philosophical study of morality.", "options": ["Ethics", "Value", "Future", "Norms"]},
        {"questionId": "q29", "question": "_______ is a set of social rules and standards that guide the conduct of people in a society.", "options": ["Norms", "Culture", "Value", "Morality"]},
        {"questionId": "q30", "question": "Nigerians are guaranteed certain individual freedom under ______.", "options": ["The Bill of Right", "Value", "Sculpture", "Norms"]},
        {"questionId": "q31", "question": "_______ in relation to norms are values that shape both personal and social experience.", "options": ["Value", "Belief", "Social", "Norms"]},
        {"questionId": "q32", "question": "_______ are approved standards of behavior passed on from one generation to the other.", "options": ["Folkways", "More", "Law", "Value"]},
        {"questionId": "q33", "question": "______ are central beliefs of a culture that provide a standard by which norms are judged.", "options": ["Values", "Folkways", "More", "Laws"]},
        {"questionId": "q34", "question": "Values are ______ to individuals or groups of persons.", "options": ["Culturally Specific", "Law", "Infrastructure", "All of the above"]},
        {"questionId": "q35", "question": "Violation of folkways are usually handled informally through ______.", "options": ["Gesture", "Belief", "Patriotism", "Rock"]},
        {"questionId": "q36", "question": "______ is a value upheld in every society to have positive attitude to one's country.", "options": ["Patriotism", "Belief", "Gesture", "Rock"]},
        {"questionId": "q37", "question": "______ are cultural beliefs of a culture that provides a standard by which norms are judged.", "options": ["Values", "Belief", "Norms", "Moral"]},
        {"questionId": "q38", "question": "______ is subject to the dictates of moral principle.", "options": ["Morality", "Social Standing", "Value", "None of the above"]},
        {"questionId": "q39", "question": "______ is sometimes synonymous with morality as both are often used interchangeably.", "options": ["Morality", "Social Standing", "Value", "None of the above"]},
        {"questionId": "q40", "question": "______ is a call of re-awakening for the actualization of a better and newer skill for the overall benefit and development of an individual and the society.", "options": ["Re-orientation", "Value", "Morality", "Crime and Value"]},
        {"questionId": "q41", "question": "______ is a single anti-social menace that has consistently ravaged the nation.", "options": ["Crime", "Cultism", "Morality", "Value"]},
        {"questionId": "q42", "question": "______ is a contemporary social menace affecting the educational sector.", "options": ["Cultism", "Crime", "Morality", "Value"]},
        {"questionId": "q43", "question": "______ is a shift of members of societies from morality to instant wealth.", "options": ["Materialism", "Patriotism", "Cultism", "None of the above"]},
        {"questionId": "q44", "question": "The stunted growth in Nigeria is due to ______.", "options": ["Moral Problems", "Morality", "Materialism", "None of the above"]},
        {"questionId": "q45", "question": "______ comprises several clans which are bound together by language and tradition.", "options": ["Nation", "Africa", "USA", "Italy"]},
        {"questionId": "q46", "question": "Africa consists of ______ nations around the South-Saharan desert.", "options": ["52", "40", "100", "81"]},
        {"questionId": "q47", "question": "There are ______ component elements which constitute the structure of African religion.", "options": ["5", "4", "6", "10"]},
        {"questionId": "q48", "question": "The ______ are next in rank to the Supreme Being.", "options": ["Divinities", "Esu", "Magic", "Spirit"]},
        {"questionId": "q49", "question": "______ is spoken of as the idea of partial rebirth.", "options": ["Reincarnation", "Divinities", "Magic", "Context"]},
        {"questionId": "q50", "question": "______ is the art of using the available force of nature to prevent diseases and restore health.", "options": ["Magic", "Divinities", "Spirit", "Medicine"]}
    ]
    selected_questions = random.sample(questions, 25)
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        "body": json.dumps({"questions": selected_questions})
    }
