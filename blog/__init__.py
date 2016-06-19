from .oglop_neo4j import Neo
from .views import app


def create_uniqueness_constraint(label, prop):
    """
    Create unique constraints
    :param label: Node Label
    :param prop: Node property
    """
    query = "CREATE CONSTRAINT ON (n:{label}) ASSERT n.{prop} IS UNIQUE"
    query = query.format(label=label, prop=prop)
    Neo.run(query)

create_uniqueness_constraint("User", "username")
create_uniqueness_constraint("User", "email")
create_uniqueness_constraint("Tag", "title")
create_uniqueness_constraint("Post", "slug")
create_uniqueness_constraint("Category", "title")
