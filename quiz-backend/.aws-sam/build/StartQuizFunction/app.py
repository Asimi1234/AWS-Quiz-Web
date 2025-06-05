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
        {"questionId": "q1", "question": "Which of the following best defines a system?", "options": ["A functioning entity or whole", "A collection of unrelated components", "A set of complex systems", "A group of interconnected parts working together towards a common goal"]},
        {"questionId": "q2", "question": "What are the components of a system dependent on?", "options": ["The system's constraints", "The system's purpose", "The environment", "Other system components"]},
        {"questionId": "q3", "question": "What is the relationship between the properties and behaviour of system components?", "options": ["They are independent", "They are unrelated", "They are inextricably inter-mingled", "They are completely separate"]},
        {"questionId": "q4", "question": "What is systems thinking primarily focused on?", "options": ["Isolated components", "Linear processes", "Interrelationships and feedback", "Random decision-making"]},
        {"questionId": "q5", "question": "Which of the following best describes a system?", "options": ["A random collection of objects", "A set of isolated functions", "Interconnected components working together", "A rigid hierarchy"]},
        {"questionId": "q6", "question": "In systems thinking, feedback loops are used to:", "options": ["Speed up processes", "Ignore external factors", "Reinforce or balance system behaviour", "Separate components"]},
        {"questionId": "q7", "question": "A reinforcing feedback loop tends to:", "options": ["Stabilize a system", "Slow down system growth", "Amplify change in the system", "Eliminate feedback"]},
        {"questionId": "q8", "question": "A balancing feedback loop helps a system to:", "options": ["Accelerate changes", "Self-correct or maintain stability", "Remove constraints", "Collapse faster"]},
        {"questionId": "q9", "question": "A causal loop diagram is used to:", "options": ["Design hardware", "Show cause-effect relationships", "Perform statistical analysis", "Calculate efficiency"]},
        {"questionId": "q10", "question": "Stock and flow diagrams represent:", "options": ["Organizational hierarchy", "Resource allocation", "Accumulations and rates of change", "Feedback messages"]},
        {"questionId": "q11", "question": "Which is an example of a stock in a water system model?", "options": ["Water inflow", "Water level in the tank", "Valve opening", "Pump speed"]},
        {"questionId": "q12", "question": "Flows in a system represent:", "options": ["Fixed values", "Feedback messages", "Rates of change of stocks", "Data inputs"]},
        {"questionId": "q13", "question": "Delays in a system typically:", "options": ["Make systems faster", "Reduce feedback effects", "Cause instability or oscillation", "Eliminate loops"]},
        {"questionId": "q14", "question": "In a water treatment plant, a feedback loop might be used to:", "options": ["Clean filters manually", "Shut down all operations", "Adjust chemical dosing based on water quality", "Disable alarms"]},
        {"questionId": "q15", "question": "Which of the following is a key benefit of systems thinking in organizations?", "options": ["Individual performance tracking", "Siloed decision-making", "Holistic problem-solving", "Speed-only focus"]},
        {"questionId": "q16", "question": "Systems thinking helps avoid:", "options": ["Deep analysis", "Long-term solutions", "Short-sighted decisions", "Stakeholder engagement"]},
        {"questionId": "q17", "question": "Which of the following is a leverage point in a system?", "options": ["An unchangeable factor", "A component with no effect", "A small input that causes big changes", "A broken component"]},
        {"questionId": "q18", "question": "Which of these is NOT a principle of systems thinking?", "options": ["Focus on relationships", "Linear cause and effect", "Holistic analysis", "Feedback awareness"]},
        {"questionId": "q19", "question": "What is a \"limits to growth\" archetype?", "options": ["Unchanging system", "System grows indefinitely", "System grows, then slows or stops due to constraints", "System collapses suddenly"]},
        {"questionId": "q20", "question": "The \"tragedy of the commons\" archetype involves:", "options": ["Collective success", "Shared resources being depleted", "Balanced usage of public goods", "Government subsidies"]},
        {"questionId": "q21", "question": "\"Shifting the burden\" refers to:", "options": ["Solving the root cause", "Ignoring problems", "Using quick fixes rather than long-term solutions", "Efficient delegation"]},
        {"questionId": "q22", "question": "The \"fixes that fail\" pattern typically results in:", "options": ["Lasting improvement", "System simplification", "Long-term success", "Temporary improvement followed by worse problems"]},
        {"questionId": "q23", "question": "In systems thinking, a \"leverage point\" is most effective when it:", "options": ["Focuses on system structure or goals", "Changes only surface behaviours", "Involves only external factors", "Avoids feedback loops"]},
        {"questionId": "q24", "question": "Which profession benefits most from systems thinking?", "options": ["Systems engineers only", "IT professionals only", "All disciplines dealing with complexity", "Sports coaches"]},
        {"questionId": "q25", "question": "In supply chain systems, systems thinking can help to:", "options": ["Create bottlenecks", "Isolate departments", "Improve flow and reduce waste", "Increase redundancy only"]},
        {"questionId": "q26", "question": "Systems thinking promotes which type of decision-making?", "options": ["Isolated", "Intuitive only", "Reactive", "Informed and long-term"]},
        {"questionId": "q27", "question": "Which situation best demonstrates systems thinking failure?", "options": ["Root cause analysis", "Continuous improvement", "Ignoring upstream water pollution while treating only at the plant", "Regular feedback meetings"]},
        {"questionId": "q28", "question": "Systems thinking in environmental management helps to:", "options": ["Increase pollution", "See environmental and economic trade-offs", "Avoid stakeholder engagement", "Ignore ecosystems"]},
        {"questionId": "q29", "question": "Emergence in systems refers to:", "options": ["Predictable behaviour of parts", "The system's behaviour being more than the sum of its parts", "An isolated change", "Complete randomness"]},
        {"questionId": "q30", "question": "Mental models in systems thinking are:", "options": ["Physical machine diagrams", "Policies for hiring", "Deeply held beliefs that influence decisions", "Computer simulations only"]},
        {"questionId": "q31", "question": "A systems thinker views delays as:", "options": ["Unimportant", "Necessary evil", "Critical for understanding system behaviour", "Impossible to model"]},
        {"questionId": "q32", "question": "In a dynamic system, complexity arises from:", "options": ["A single cause", "Random chance", "Multiple interrelated parts and feedbacks", "Just external shocks"]},
        {"questionId": "q33", "question": "Systems thinking encourages looking at:", "options": ["Symptoms only", "Individual blame", "Patterns, structures, and root causes", "Short-term wins"]},
        {"questionId": "q34", "question": "Systems thinking considers how parts of a system interact with each other.", "options": ["True", "False"]},
        {"questionId": "q35", "question": "A system's behaviour can always be predicted by analyzing its individual components separately.", "options": ["True", "False"]},
        {"questionId": "q36", "question": "Feedback loops are essential elements in systems thinking.", "options": ["True", "False"]},
        {"questionId": "q37", "question": "In systems thinking, delays have no significant impact on system behaviour.", "options": ["True", "False"]},
        {"questionId": "q38", "question": "A balancing feedback loop attempts to bring the system to a desired state or equilibrium.", "options": ["True", "False"]},
        {"questionId": "q39", "question": "A reinforcing feedback loop stabilizes system behaviour.", "options": ["True", "False"]},
        {"questionId": "q40", "question": "Mental models influence how people perceive and respond to systems.", "options": ["True", "False"]},
        {"questionId": "q41", "question": "Emergent behaviour means a system acts exactly as predicted from its parts.", "options": ["True", "False"]},
        {"questionId": "q42", "question": "Systems thinking encourages short-term fixes over long-term solutions.", "options": ["True", "False"]},
        {"questionId": "q43", "question": "Causal loop diagrams can show how variables in a system influence each other.", "options": ["True", "False"]},
        {"questionId": "q44", "question": "In systems thinking, it's better to focus on events rather than underlying structures.", "options": ["True", "False"]},
        {"questionId": "q45", "question": "Systems thinking applies only to engineering and technical disciplines.", "options": ["True", "False"]},
        {"questionId": "q46", "question": "The \"tragedy of the commons\" is an example of a systems archetype.", "options": ["True", "False"]},
        {"questionId": "q47", "question": "Stock and flow diagrams are used to understand accumulations and changes over time.", "options": ["True", "False"]},
        {"questionId": "q48", "question": "Delays in feedback can cause oscillations in system behaviour.", "options": ["True", "False"]},
        {"questionId": "q49", "question": "Systems thinking promotes viewing problems from multiple perspectives.", "options": ["True", "False"]},
        {"questionId": "q50", "question": "In systems thinking, leverage points are places in a system where a small shift can lead to big changes.", "options": ["True", "False"]},
        {"questionId": "q51", "question": "Systems thinking is not useful for environmental or sustainability issues.", "options": ["True", "False"]},
        {"questionId": "q52", "question": "Changing the structure of a system can often have more impact than changing individual components.", "options": ["True", "False"]},
        {"questionId": "q53", "question": "Systems thinking always provides simple, quick solutions to complex problems.", "options": ["True", "False"]},
        {"questionId": "q54", "question": "Systems Thinking focuses on isolated events rather than patterns of behavior over time.", "options": ["True", "False"]},
        {"questionId": "q55", "question": "A feedback loop is a circular process in which a system's output serves as input to the same system.", "options": ["True", "False"]},
        {"questionId": "q56", "question": "In a balancing loop, the system tends to move away from equilibrium.", "options": ["True", "False"]},
        {"questionId": "q57", "question": "Delays in a system can lead to overreaction and instability if not accounted for.", "options": ["True", "False"]},
        {"questionId": "q58", "question": "Leverage points are areas in a system where small changes can lead to significant impacts.", "options": ["True", "False"]},
        {"questionId": "q59", "question": "Systems Thinking ignores the relationships between system components.", "options": ["True", "False"]},
        {"questionId": "q60", "question": "Causal loop diagrams help visualize feedback structures within a system.", "options": ["True", "False"]},
        {"questionId": "q61", "question": "The iceberg model suggests that events are the best place to intervene in a system.", "options": ["True", "False"]},
        {"questionId": "q62", "question": "Systems Thinking discourages considering unintended consequences of actions.", "options": ["True", "False"]},
        {"questionId": "q63", "question": "Stocks are accumulations of resources or information in a system.", "options": ["True", "False"]},
        {"questionId": "q64", "question": "A reinforcing loop leads to exponential growth or decline.", "options": ["True", "False"]},
        {"questionId": "q65", "question": "Systems Thinking is only applicable to engineering problems.", "options": ["True", "False"]},
        {"questionId": "q66", "question": "Systems Thinking requires a linear cause-and-effect mindset.", "options": ["True", "False"]},
        {"questionId": "q67", "question": "Mental models influence how people understand and act within systems.", "options": ["True", "False"]},
        {"questionId": "q68", "question": "System boundaries determine what is included or excluded in analysis.", "options": ["True", "False"]},
        {"questionId": "q69", "question": "Every system is composed of parts that do not interact.", "options": ["True", "False"]},
        {"questionId": "q70", "question": "Unintended consequences are rare in complex systems.", "options": ["True", "False"]},
        {"questionId": "q71", "question": "A system archetype is a recurring pattern of system behaviour.", "options": ["True", "False"]},
        {"questionId": "q72", "question": "The behaviour of a system can always be predicted with certainty.", "options": ["True", "False"]},
        {"questionId": "q73", "question": "Rich pictures are a tool used to visualize the structure and relationships in complex systems.", "options": ["True", "False"]},
        {"questionId": "q74", "question": "The angle between the horizontal and vertical plane in orthographic projection is:", "options": ["30°", "45°", "60°", "90°"]},
        {"questionId": "q75", "question": "First angle projection is predominantly used in:", "options": ["United States", "India", "Canada", "Australia"]},
        {"questionId": "q76", "question": "The instrument used for drawing circles and arcs is:", "options": ["Divider", "French curve", "Compass", "T-square"]},
        {"questionId": "q77", "question": "Which projection shows the object as it appears to the eye?", "options": ["Orthographic projection", "Isometric projection", "Perspective projection", "Axonometric projection"]},
        {"questionId": "q78", "question": "In first angle projection, the object is placed:", "options": ["Between observer and vertical plane", "Between observer and horizontal plane", "Between planes", "Behind all planes"]},
        {"questionId": "q79", "question": "The line used to represent an imaginary cut in sectional views is:", "options": ["Centre line", "Section line", "Cutting plane line", "Hidden line"]},
        {"questionId": "q80", "question": "The recommended lettering height for title blocks is:", "options": ["1 mm", "2.5 mm", "5 mm", "10 mm"]},
        {"questionId": "q81", "question": "A visible edge in a drawing is represented by a:", "options": ["Dashed line", "Thick continuous line", "Thin continuous line", "Chain line"]},
        {"questionId": "q82", "question": "The standard ISO paper size used for engineering drawings is:", "options": ["A3", "A4", "A0", "Letter size"]},
        {"questionId": "q83", "question": "Orthographic projection views are aligned:", "options": ["Diagonally", "Horizontally and vertically", "Randomly", "In any sequence"]},
        {"questionId": "q84", "question": "The standard scale for drawing full-size objects is:", "options": ["1:2", "2:1", "1:1", "1:5"]},
        {"questionId": "q85", "question": "In isometric drawing, the angle between any two isometric axes is:", "options": ["45°", "90°", "120°", "30°"]},
        {"questionId": "q86", "question": "A thin continuous line is used for:", "options": ["Hidden edges", "Dimensions and projection lines", "Visible outlines", "Section lining"]},
        {"questionId": "q87", "question": "The method used to draw inclined surfaces in orthographic views is:", "options": ["Projection", "Revolution", "Auxiliary views", "Perspective views"]},
        {"questionId": "q88", "question": "Which of the following is not a type of pictorial drawing?", "options": ["Isometric", "Oblique", "Orthographic", "Perspective"]},
        {"questionId": "q89", "question": "In third-angle projection, the object is placed:", "options": ["In the third quadrant", "In the first quadrant", "Behind the observer", "Between the observer and the plane"]},
        {"questionId": "q90", "question": "Which drawing instrument is used to draw parallel lines?", "options": ["Set square", "Compass", "French curve", "T-square"]},
        {"questionId": "q91", "question": "The standard projection method used in India is:", "options": ["Third angle", "Oblique", "First angle", "Perspective"]},
        {"questionId": "q92", "question": "The front view of an object is projected on the:", "options": ["Profile plane", "Horizontal plane", "Vertical plane", "Auxiliary plane"]},
        {"questionId": "q93", "question": "A hidden line is represented by:", "options": ["Solid thick line", "Thin continuous line", "Dashed line", "Chain line"]},
        {"questionId": "q94", "question": "The tool used to draw an ellipse manually is:", "options": ["Protractor", "Ellipse template", "Divider", "Compass"]},
        {"questionId": "q95", "question": "Which line type is used for centre lines?", "options": ["Thick dashed", "Thin continuous", "Long dash-short dash", "Thick chain"]},
        {"questionId": "q96", "question": "The number of principal orthographic views usually required is:", "options": ["One", "Two", "Three", "Four"]},
        {"questionId": "q97", "question": "The height of capital letters for general notes in technical drawings is typically:", "options": ["2 mm", "3 mm", "5 mm", "8 mm"]},
        {"questionId": "q98", "question": "An isometric drawing distorts the object by:", "options": ["Increasing the actual dimensions", "Reducing the actual dimensions", "Equally foreshortening all axes", "Using perspective"]},
        {"questionId": "q99", "question": "What is the purpose of dimension lines?", "options": ["Represent the outline", "Show edges", "Indicate the size and position", "Mark sections"]},
        {"questionId": "q100", "question": "What is the standard projection plane for the top view?", "options": ["Vertical plane", "Auxiliary plane", "Horizontal plane", "Profile plane"]},
        {"questionId": "q101", "question": "Which of the following is not a standard engineering drawing scale?", "options": ["1:1", "1:2", "2:3", "10:1"]},
        {"questionId": "q102", "question": "The right-side view of an object is projected on the:", "options": ["Profile plane", "Horizontal plane", "Vertical plane", "Auxiliary plane"]},
        {"questionId": "q103", "question": "Which drawing method uses height, width, and depth axes at equal angles?", "options": ["Oblique drawing", "Perspective drawing", "Isometric drawing", "Orthographic drawing"]},
        {"questionId": "q104", "question": "The true shape of an inclined surface can be seen in:", "options": ["Front view", "Side view", "Auxiliary view", "Top view"]},
        {"questionId": "q105", "question": "The instrument used to measure angles is called a:", "options": ["Divider", "Compass", "French curve", "Protractor"]},
        {"questionId": "q106", "question": "The point where all vanishing lines in a perspective drawing converge is called:", "options": ["Center of projection", "Vanishing point", "Horizon line", "Base line"]},
        {"questionId": "q107", "question": "A section view that shows half of the object cut and half uncut is called:", "options": ["Full section", "Offset section", "Half section", "Removed section"]},
        {"questionId": "q108", "question": "A line that is perpendicular to the projection plane appears as:", "options": ["True length", "Shortened", "Point", "Inclined"]},
        {"questionId": "q109", "question": "A fillet in a mechanical drawing is:", "options": ["A groove", "A rounded interior corner", "A sharp edge", "A threaded feature"]},
        {"questionId": "q110", "question": "An oblique drawing has one face:", "options": ["Perpendicular to the viewing plane", "Parallel to all axes", "Drawn in isometric", "Tilted to enhance visibility"]},
        {"questionId": "q111", "question": "Hatching in a sectional view indicates:", "options": ["Surface finish", "Shadows", "Material cut by the plane", "Tolerances"]},
        {"questionId": "q112", "question": "An exploded view drawing is used to:", "options": ["Show internal cuts", "Show dimensions", "Show all parts separately in assembly", "Show tolerances"]},
        {"questionId": "q113", "question": "The projection system where the object lies between the observer and the projection plane is:", "options": ["Third angle", "First angle", "Axonometric", "Isometric"]},
        {"questionId": "q114", "question": "A leader line is used to:", "options": ["Indicate symmetry", "Connect a note to a feature", "Represent a hidden edge", "Show a centreline"]},
        {"questionId": "q115", "question": "Which scale reduces the actual size of an object in a drawing?", "options": ["Enlarging scale", "Reducing scale", "Full scale", "Diagonal scale"]},
        {"questionId": "q116", "question": "The abbreviation \"R\" in dimensioning stands for:", "options": ["Radius", "Roughness", "Roundness", "Reference"]},
        {"questionId": "q117", "question": "A concentric circle pattern can be best drawn using a:", "options": ["Divider", "French curve", "Compass", "Protractor"]},
        {"questionId": "q118", "question": "Which view provides the most information about an object's shape?", "options": ["Front view", "Top view", "Side view", "Auxiliary view"]},
        {"questionId": "q119", "question": "What kind of projection maintains true shape and size?", "options": ["Oblique", "Isometric", "Orthographic", "Perspective"]},
        {"questionId": "q120", "question": "The lines used to terminate dimension lines are called:", "options": ["Leader lines", "Arrowheads", "Section lines", "Cutting plane lines"]},
        {"questionId": "q121", "question": "What does a phantom line indicate in technical drawing?", "options": ["Alternate positions of moving parts", "Hidden features", "Symmetry", "Cutting plane"]},
        {"questionId": "q122", "question": "In CAD software, layers are used to:", "options": ["Add shading", "Organize and control visibility of elements", "Perform calculations", "Add materials"]},
        {"questionId": "q123", "question": "Orthographic projection represents a 3D object in 2D using multiple views.", "options": ["True", "False"]},
        {"questionId": "q124", "question": "In third angle projection, the object is placed between the observer and the plane.", "options": ["True", "False"]},
        {"questionId": "q125", "question": "A compass is used to draw straight lines.", "options": ["True", "False"]},
        {"questionId": "q126", "question": "Isometric drawings show objects at equal angles of 120° between axes.", "options": ["True", "False"]},
        {"questionId": "q127", "question": "Hidden lines are represented using thick continuous lines.", "options": ["True", "False"]},
        {"questionId": "q128", "question": "In first-angle projection, the top view is placed below the front view.", "options": ["True", "False"]},
        {"questionId": "q129", "question": "A section view shows the interior details of a part.", "options": ["True", "False"]},
        {"questionId": "q130", "question": "The T-square is used to draw vertical lines.", "options": ["True", "False"]},
        {"questionId": "q131", "question": "Perspective projection gives a realistic view of objects as seen by the eye.", "options": ["True", "False"]},
        {"questionId": "q132", "question": "Oblique projection shows the front face in true size and shape.", "options": ["True", "False"]},
        {"questionId": "q133", "question": "The standard paper size A4 is commonly used for large engineering drawings.", "options": ["True", "False"]},
        {"questionId": "q134", "question": "Dimension lines should not touch the drawing.", "options": ["True", "False"]},
        {"questionId": "q135", "question": "A centreline is used to show symmetry in a drawing.", "options": ["True", "False"]},
        {"questionId": "q136", "question": "Auxiliary views are used to show inclined surfaces in true shape.", "options": ["True", "False"]},
        {"questionId": "q137", "question": "Hatching lines indicate areas where the material is cut in a section view.", "options": ["True", "False"]},
        {"questionId": "q138", "question": "The front view is projected onto the horizontal plane.", "options": ["True", "False"]},
        {"questionId": "q139", "question": "Scale 1:2 means the drawing is twice as large as the object.", "options": ["True", "False"]},
        {"questionId": "q140", "question": "A French curve is used to draw smooth, irregular curves.", "options": ["True", "False"]},
        {"questionId": "q141", "question": "Third angle projection is the standard in India.", "options": ["True", "False"]},
        {"questionId": "q142", "question": "Arrowheads are used to terminate dimension lines.", "options": ["True", "False"]},
        {"questionId": "q143", "question": "CAD software can be used to create both 2D and 3D drawings.", "options": ["True", "False"]},
        {"questionId": "q144", "question": "Profile plane is used for projecting the top view.", "options": ["True", "False"]},
        {"questionId": "q145", "question": "Exploded views are used to show the assembly of components.", "options": ["True", "False"]},
        {"questionId": "q146", "question": "Orthographic drawings require at least four views to describe an object fully.", "options": ["True", "False"]},
        {"questionId": "q147", "question": "A fillet is a small rounded inside corner between two surfaces.", "options": ["True", "False"]},
        {"questionId": "q148", "question": "Phantom lines are used to represent alternate positions of a moving part.", "options": ["True", "False"]},
        {"questionId": "q149", "question": "A section line is used to indicate centrelines in circles.", "options": ["True", "False"]},
        {"questionId": "q150", "question": "The title block contains information like scale, name, and date.", "options": ["True", "False"]},
        {"questionId": "q151", "question": "Lettering in technical drawing must be clear and legible.", "options": ["True", "False"]},
        {"questionId": "q152", "question": "Projection lines should be drawn dark and thick.", "options": ["True", "False"]}
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
      "options": ["C-O-C and C-C", "CHO and C=O", "C≡O and C═C-", "C=O and -O-",]
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
