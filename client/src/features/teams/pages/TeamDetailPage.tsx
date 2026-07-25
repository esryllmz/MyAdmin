import { useNavigate, useParams } from 'react-router-dom';
import { TEAMS } from '../data/teamsMock';

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const team = TEAMS.find((candidate) => candidate.id === id);

  if (!team) {
    return (
      <div className="p-8 max-w-3xl mx-auto w-full text-center py-24">
        <p className="text-on-surface-variant dark:text-dark-on-surface-variant">Takım bulunamadı.</p>
        <button onClick={() => navigate('/teams')} className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:underline">
          Takımlara dön
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-3xl mx-auto w-full">
      <button
        onClick={() => navigate('/teams')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Teams
      </button>

      <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">{team.name}</h2>
      <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1.5">{team.description}</p>

      <div className="mt-8 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
        {team.members.map((member) => (
          <div key={member.username} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">@{member.username}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-1 rounded">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamDetailPage;
