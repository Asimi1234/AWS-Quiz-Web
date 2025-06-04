import json
import random

QUESTION_BANK = {
    "GST112" : [
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
    ],
    "GET102" : [
    ],
     "CHM102": [
    {
      "questionId": "q1",
      "question": "The alkali metals are characterised by ________  in their outermost shell",
      "options": ["one s-electron", "two s-electron", "three s-electron", "zero s-electron"]
    },
    {
      "questionId": "q2",
      "question": "Group 1 metals melting and boiling point ________ as we go down the group",
      "options": ["decreases", "increases", "fluctuates", "remains constant"]
    },
    {
      "questionId": "q3",
      "question": "One of the most important applications of Potassium is in the manufacture of __________",
      "options": ["batteries for electronics and vehicles", "Soap and edible salt", "Fertilizers and biochemical substrates", "Optical glasses and laser coolants"]
    },
    {
      "questionId": "q4",
      "question": "Which of the following alkaline earth metals gives the LEAST soluble sulphate?",
      "options": ["Mg", "Ca", "Sr", "Ba"]
    },
    {
      "questionId": "q5",
      "question": "The Group 3A elements are also called boron family because boron is  __________ of the group.",
      "options": ["the first member", "the last member", "a non-member", "an intermediate member"]
    },
    {
      "questionId": "q6",
      "question": "All group 3A elements have +3 oxidation state EXCEPT  thallium which has _______",
      "options": ["+1", "-1", "+2", "-2"]
    },
    {
      "questionId": "q7",
      "question": "The group iv A elements are characterised by ________  in their outermost shell",
      "options": ["zero s-electron and zero p-electron", "two s-electron and one p-electron", "two s-electron and three p-electron", "two s-electron and two p-electron"]
    },
    {
      "questionId": "q8",
      "question": "Which of the following is diamagnetic?",
      "options": ["Mn2+", "Ni2+", "Sc3+", "Cu3+"]
    },
    {
      "questionId": "q9",
      "question": "Which of the following statement is not correct?",
      "options": [
        "in a stable nucleus, the nuclear forces of attraction between the nucleons are greater than the electrostatic force of repulsion between the protons.",
        "in an unstable nucleus, the electrostatic force of repulsion between the protons are greater than the nuclear forces of attraction between the nucleons",
        "if the nucleus is stable, it will disintegrate",
        "none of the above."
      ]
    },
    {
      "questionId": "q10",
      "question": "Which of the following is the possible oxidation state of 26Fe?",
      "options": ["+1 to +3", "+1 to +6", "+2 to +7", "+2 to +6"]
    },
    {
      "questionId": "q11",
      "question": "Calculate the amount of a radioactive element (t1/2 = 140days) to which 1g of the element will reduce to in 560days.",
      "options": ["0.0215g", "0.0445g", "0.0625g", "0.835g"]
    },
    {
      "questionId": "q12",
      "question": "Calculate the spin only moment of Cr3+ ; d3",
      "options": ["3.87BM", "1.23BM", "2.09BM", "4.21BM"]
    },
    {
      "questionId": "q13",
      "question": "According to the odd-even rules for nuclear stability, which of the following will be stable?",
      "options": ["64Cu-29", "24Mg-12", "14N-7", "24Na-11"]
    },
    {
      "questionId": "q14",
      "question": "Transition metals have high ionization energy due to their ………..",
      "options": ["large atomic size", "high melting point", "small atomic radii", "high reactivity"]
    },
    {
      "questionId": "q15",
      "question": "Which of the following is not correct?",
      "options": [
        "the colour of transition metal complex depends on the nature of the metal",
        "the oxidation state of the transition metal doesn’t determine the colour",
        "the nature of the ligand has effects on the colour of the complex",
        "the number of ligand has effects on the colour of the complex."
      ]
    },
    {
      "questionId": "q16",
      "question": "Who is regarded as the father of modern organic chemistry?",
      "options": ["Antoine Lavoisier", "Friedrich Wöhler", "Dmitri Mendeleev", "None of the above"]
    },
    {
      "questionId": "q17",
      "question": "A pure organic substance has the following characteristic physical properties except",
      "options": ["crystalline form", "refractive index and specific gravity", "solubility and volatility", "melting point and boiling point"]
    },
    {
      "questionId": "q18",
      "question": "The development of structural theories like valence theory by Kekulé and Couper in 1858 helped scientists understand:",
      "options": ["the origin of life", "the properties of organic compounds", "how to create explosives", "the role of enzymes in reactions"]
    },
    {
      "questionId": "q19",
      "question": "Which of the following is NOT a major focus of organic chemistry that emerged in the 19th century?",
      "options": ["isolating natural compounds", "developing synthetic methods", "studying the composition of stars", "analyzing reaction mechanisms"]
    },
    {
      "questionId": "q20",
      "question": "What elements are most commonly found in organic molecules?",
      "options": ["Carbon, hydrogen, nitrogen", "Oxygen, phosphorus, sulfur", "Nitrogen, sulfur, phosphorus", "Carbon, hydrogen, oxygen"]
    },
    {
      "questionId": "q21",
      "question": "Which type of hydrocarbons are nonreactive due to lack of polarity?",
      "options": ["Alkynes", "Alkenes", "Alkanes", "Aromatics"]
    },
    {
      "questionId": "q22",
      "question": "What causes polarity in organic molecules?",
      "options": ["Even distribution of electron density", "Non-polar C-H bonds", "Non-polar C-C bonds", "Imbalance in electron density"]
    },
    {
      "questionId": "q23",
      "question": "Complete oxidation of Primary alcohol using KMnO4/H+ will produced compound with the general formula",
      "options": ["RCHO", "RCOOR", "RCOR", "RCOOH"]
    },
    {
      "questionId": "q24",
      "question": "The general formula for aldehyde is ..........",
      "options": ["RCHO", "R(CO)2O", "ROH", "ROOH"]
    },
    {
      "questionId": "q25",
      "question": "Reduction of this compound CH3CH2CH2CONH2 will result to formation of .........",
      "options": ["propylamine", "Butylamine", "Hexylamine", "N-methyl-ethylamine"]
    },
    {
      "questionId": "q26",
      "question": "The functional group of an alkanones and ether are?",
      "options": ["C-O-C and C-C", "CHO and C=O", "C≡O and C═C-", "C=O and -O-"]
    },
    {
      "questionId": "q27",
      "question": "The condensed formula for 2-methyl butan-2-ol is .........",
      "options": ["CH3CH2(CH3)OHCH3", "CH3CH2(CH3)OHCH2CH3", "CH3C(CH3)OHCH2CH3", "C2H5OHC2H5"]
    },
    {
      "questionId": "q28",
      "question": "The major product formed during dehydration of butan-2-ol using conc. H2SO4 at 180oC is ............",
      "options": ["butene", "but-3-ene", "but-2-ene", "but-4-ene"]
    },
    {
      "questionId": "q29",
      "question": "The ester CH3COOC2H5   is produced by the reaction of --------- and ---------",
      "options": ["ethanoic acid and methanol", "methanal and acetic acid", "ethanol and ethanoic acid", "methanoic acid and ethanol"]
    },
    {
      "questionId": "q30",
      "question": "A method of separating mixtures based on differences in their volatilities in a boiling liquid mixture is called",
      "options": ["Fractional distillation", "Distillation", "Crystallization", "Fractional Crystallization"]
    }
  ]
}

def lambda_handler(event, context):
    try:
        course_id = None
        if event.get("queryStringParameters"):
            course_id_raw = event["queryStringParameters"].get("courseId")
            if course_id_raw:
                course_id = course_id_raw.upper()
        else:
            body = json.loads(event.get("body", "{}"))
            course_id_raw = body.get("courseId")
            if course_id_raw:
                course_id = course_id_raw.upper()

        if not course_id or course_id not in QUESTION_BANK:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid or missing courseId"})
            }

        questions = QUESTION_BANK[course_id]
        selected_questions = random.sample(questions, min(25, len(questions)))

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
            },
            "body": json.dumps({"questions": selected_questions})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
