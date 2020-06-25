alter table identities
drop constraint identities_user_id_fkey,
add constraint sidentities_user_id_fkey
   foreign key (user_id)
   references users(id)
   on delete cascade;