interface Props {
    current: number;
    total: number;
}

export default function QuizProgress({ current, total }: Props) {

    const percentage = ((current + 1) / total) * 100;

    return (

        <div className="mb-8">

            <div className="flex justify-between mb-2">

                <span className="font-semibold">

                    Question {current + 1} of {total}

                </span>

                <span>

                    {Math.round(percentage)}%

                </span>

            </div>

            <div className="bg-gray-200 h-3 rounded-full">

                <div

                    className="bg-blue-600 h-3 rounded-full transition-all"

                    style={{

                        width: `${percentage}%`

                    }}

                />

            </div>

        </div>

    );

}