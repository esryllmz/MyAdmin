import { Link } from 'react-router-dom';
import { TEAMS } from '../data/teamsMock';

const TeamsPage = () => {
  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">Teams</h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
          Bu ortamda takımlar istemci tarafında gruplanır — backend'de ayrı bir Team varlığı bulunmuyor.
        </p>
      </div>

      {TEAMS.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant dark:text-dark-on-surface-variant">
          Henüz tanımlı takım yok.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEAMS.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest p-6 hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
            >
              <h3 className="text-base font-semibold text-on-surface dark:text-dark-on-surface">{team.name}</h3>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1.5 leading-5">{team.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                <span>{team.members.length} members</span>
                <span>{new Date(team.createdDate).toLocaleDateString('tr-TR')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
