import pytest

from hermeneut.db import Store
from hermeneut.models import ConsentScope, Participant, Project


@pytest.fixture
def store(tmp_path):
    db_path = tmp_path / "test.db"
    s = Store(str(db_path))
    s.create_project(Project(id='p'))
    return s


@pytest.fixture
def participant(store):
    return store.put_participant(Participant(
        id='A', project_id='p', pseudonym='A', consent_scope=ConsentScope(),
    ))
