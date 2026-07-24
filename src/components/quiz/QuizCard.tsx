import { QuizQuestion } from "../../types/quiz";

interface Props {

    question: QuizQuestion;

    selected: number | null;

    setSelected: (value:number)=>void;

}

export default function QuizCard({

    question,

    selected,

    setSelected

}:Props){

    return(

        <div>

            <h2 className="text-2xl font-bold mb-8">

                {question.question}

            </h2>

            <div className="space-y-4">

                {

                    question.options.map((option,index)=>(

                        <button

                            key={index}

                            onClick={()=>setSelected(index)}

                            className={`

                            w-full

                            p-4

                            rounded-lg

                            border-2

                            text-left

                            transition

                            ${
                                selected===index

                                ?

                                "border-blue-600 bg-blue-50"

                                :

                                "border-gray-300"

                            }

                            `}

                        >

                            {option}

                        </button>

                    ))

                }

            </div>

        </div>

    )

}