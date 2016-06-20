import bcrypt
from .help_functions import timestamp, date_today, slugify, delim_split
from .oglop_neo4j import Neo, CypherError, ResultError


def constant_factory(value):
    return lambda: value


def get_recent_posts(number):
    params = {"number": number}
    result = Neo.run(" MATCH (user:User)-[:WRITTEN]->(post:Post)<-[:TAGGED]-(tag:Tag)"
                     " RETURN user.username AS username, post, COLLECT(DISTINCT tag.title) AS tags"
                     " ORDER BY post.timestamp DESC"
                     " LIMIT {number}", params)
    return result


def find_post(post_slug):
    params = {"slug": post_slug}
    result = Neo.run(" MATCH (post:Post)<-[:TAGGED]-(tag:Tag)"
                     " WHERE post.slug={slug}"
                     " RETURN post, COLLECT(tag.title) as tags", params)
    return result.single()


class Post:
    def __init__(self, title, content, tags=None, category=None):
        pass


class User:
    def __init__(self, username):
        self.username = username.lower()

    def find(self):
        """find user and return it's node"""
        result = Neo.run("MATCH (user:User) WHERE user.username CONTAINS {username} "
                         "RETURN user",
                         {"username": self.username})
        try:
            user = result.single()
        except (CypherError, ResultError):
            print("User not found")
            return False

        return user['user']

    def register(self, password, email="Null"):
        """
        Register user
        :param password: user password
        :param email: user e-mail (optional)
        :return: True if registration successful
        """
        if not self.find():
            # create new user
            password = password.encode()
            password = bcrypt.hashpw(password, bcrypt.gensalt()).decode()
            params = {"username": self.username, "pswd": password, "email": email}

            # returns result, delete if necessary
            result = Neo.run("CREATE (user:User { username:{username}, password:{pswd}, email:{email} })"
                             "RETURN user", params)
            return True
        else:
            return False

    def verify_password(self, password):
        user = self.find()
        password = password.encode()
        if user:

            hashed = bcrypt.hashpw(password, bcrypt.gensalt())
            if bcrypt.hashpw(password, hashed) == hashed:
                return True
            else:
                return False

    def add_post(self, title, content, category=None, tags=None):
        user = self.find()
        today = date_today()
        slug = today + "_" + slugify(title)
        time = timestamp()

        # Create POST and relationship: user WRITTEN post
        # with ses.begin_transaction() as tx:
        #     pass
        params = {'title': title,
                  'slug': slug,
                  'created': today,
                  'content': content,
                  'username': user['username'],
                  'time': time,
                  }
        result = Neo.run("MATCH (user:User { username:{username} }) "
                         "CREATE path=(user)-[:WRITTEN]->"
                         "(post:Post { date_created:{created}, title:{title}, content:{content}, "
                         "slug:{slug}, timestamp:{time} }) "
                         "RETURN post", params
                         )
        try:
            post = result.single()['post']
        except CypherError:
            return False

        # relationship tag TAGGED post
        if tags:
            tags = delim_split(tags, "; ,")
            params = {'slug': slug,
                      'tags': tags,
                      }
            Neo.run(
                    "MATCH (post:Post { slug:{slug} }) "
                    "UNWIND {tags} as t_title "
                    "MERGE (tag:Tag { title: t_title }) "
                    "MERGE (tag)-[:TAGGED]->(post)",
                    params
            )

        if category:
            category = delim_split(category, "; ,")
            params = {'categories': category,
                      'slug': slug,
                      }
            # relationship tag TAGGED post
            Neo.run(
                    "MATCH (post:Post { slug:'{slug}' }) "
                    "UNWIND {categories} as c_title "
                    "MERGE (cat:Category { title: c_title }) "
                    "MERGE (post)-[:BELONGS_TO]->(cat) ",
                    params
            )

        return True

    def get_recent_posts(self, number):
        params = {"username": self.username, "number": number}
        result = Neo.run(" MATCH (user:User { username:{username} })-[:WRITTEN]->(post:Post)<-[:TAGGED]-(tag:Tag) "
                         " RETURN post, COLLECT(DISTINCT tag.title) AS tags "
                         " ORDER BY post.timestamp DESC"
                         " LIMIT {number}", params)
        return result
