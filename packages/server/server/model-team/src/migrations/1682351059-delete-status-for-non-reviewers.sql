UPDATE team_members SET status = NULL FROM teams WHERE team_members.team_id = teams.id AND teams.role != 'reviewer';
