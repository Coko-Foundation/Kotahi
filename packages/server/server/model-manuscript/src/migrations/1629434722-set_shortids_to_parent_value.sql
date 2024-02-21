update manuscripts child
set short_id=parent.short_id
from manuscripts parent
where parent.id = child.parent_id;
  