import { useProgramsByUser } from "../../api//hooks/program/useGetProgramsByUser";

const Program = () => {
    const { data, error, isLoading } = useProgramsByUser();

    console.log("Program data:", data, "Error:", error);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading program data</div>;
    if (!data || (Array.isArray(data) && data.length === 0)) return <div>Aucun programme</div>;

    return (
        <div className="flex flex-col w-full h-full pb-8 space-y-6">
            {(Array.isArray(data) ? data : []).map((program: any) => (
                <section key={program.id} className="bg-white shadow rounded p-4">
                    <header className="mb-2">
                        <h2 className="text-xl font-bold">{program.name}</h2>
                        {program.description && <p className="text-sm text-gray-600">{program.description}</p>}
                        <div className="text-xs text-gray-500 mt-1">
                            Créé le: {program.createdAt ? new Date(program.createdAt).toLocaleString() : "—"}
                        </div>
                    </header>

                    <div className="mt-3 space-y-3">
                        {(program.sessions ?? []).map((session: any) => (
                            <article key={session.id} className="border rounded p-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold">
                                            {session.date ? new Date(session.date).toLocaleDateString() : "Date inconnue"}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Durée: {session.duration ?? "—"} min
                                        </div>
                                    </div>
                                    <div className={`text-sm font-medium ${session.completed ? "text-green-600" : "text-yellow-600"}`}>
                                        {session.completed ? "Terminée" : "Prévue"}
                                    </div>
                                </div>

                                {session.notes && <p className="mt-2 text-sm text-gray-700">Notes: {session.notes}</p>}

                                <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                                    {(session.exercices ?? []).map((ex: any) => (
                                        <li key={ex.id}>
                                            <span className="font-medium">{ex.name}</span>
                                            {ex.reps && ` — ${ex.reps} reps`}
                                            {ex.sets && ` • ${ex.sets} sets`}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};

export default Program;