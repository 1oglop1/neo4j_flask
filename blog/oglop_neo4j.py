from neo4j.v1 import GraphDatabase, basic_auth, Node as neoNode, Transaction
from neo4j.v1.exceptions import *

driver = GraphDatabase.driver("bolt://192.168.2.1", auth=basic_auth("neo4j", "oglop"), encrypted=False)


class Node(neoNode):
    def __init__(self, labels=None, properties=None, **kwproperties):
        if type(labels) == str:
            labels = set(labels.split(', '))
        super().__init__(labels, properties, **kwproperties)


class Neo:
    @staticmethod
    def run(query, params=None, print_query=False, execute=True):

        """

        :param params: dictionary of parameters
        :param query: cypher query str
        :param print_query: bool, to print query, default False
        :param execute: bool, to execute query, default True
        :return: Cypher result
        """

        if print_query:
            print(query)
            print(params)

        if execute:
            session = driver.session()
            result = session.run(query, params)
            session.close()
            return result

    @staticmethod
    def query(*text: str) -> str:
        """
        Usage: query("Abc", "Def") -> 'ABC
                                       Def'
        :param text: text of query
        :return: query on multiple lines
        """
        return ' \n'.join(text)

    @staticmethod
    def session():
        return driver.session()
