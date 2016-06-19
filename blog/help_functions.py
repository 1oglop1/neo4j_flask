import string
import sys
import datetime as dt
import re



class Password:
    def __init__(self, password, min_length=3, lower=True, upper=True, digit=True):
        self.password = str(password)
        self.min_length = min_length
        self.lowercase = lower
        self.uppercase = upper
        self.digit = digit

    def password_complexity(self, no_complex=False):
        """
        Verify password complexity
        :param no_complex: skip all tests and return True, default False
        :return: True if password fulfill the conditions
        """
        if no_complex:
            print('Warning no password complexity required', file=sys.stderr)
            return True

        has_digit = has_lower = has_upper = True
        length = len(self.password) > self.min_length
        if self.lowercase:
            has_lower = any(filter(lambda x: x in string.ascii_lowercase, self.password))
        if self.uppercase:
            has_upper = any(filter(lambda x: x in string.ascii_uppercase, self.password))
        if self.digit:
            has_digit = any(filter(lambda x: x in string.digits, self.password))

        return all((length, has_digit, has_lower, has_upper))

    @property
    def conditions(self):
        """
        Return list of conditions
        """
        return list(filter(lambda x: type(self.__dict__[x]) == bool and self.__dict__[x], self.__dict__))

    def __repr__(self):
        return self.password


def timestamp():
    """
    Creates timestamp from today's date
    :return: timestamp
    """
    epoch = dt.datetime.utcfromtimestamp(0)
    now = dt.datetime.now()
    delta = now - epoch
    return delta.total_seconds()


def date_today():
    """
    Today's date
    :return: today's date in format YYYY_MM_DD
    """
    return dt.datetime.now().strftime('%Y_%m_%d')


def slugify(text):
    if len(text) < 250:
        return text.strip().lower().replace(' ', '_')
    else:
        return text[:10].strip().lower().replace(' ', '_')


def delim_split(text, delimiters):

    pattern = re.compile("[{d}]+".format(d=delimiters))
    return [word for word in re.split(pattern, text.strip()) if word]



