from .models import User, get_recent_posts
from flask import Flask, request, session, redirect, url_for, render_template, flash, get_flashed_messages
from .help_functions import Password

app = Flask(__name__)


@app.route('/')
def index():
    posts = get_recent_posts(5)
    return render_template('index.html', posts=posts)


@app.route('/logout', methods=['GET'])
def logout():
    session.pop('username', None)
    flash('Logged out.')
    return redirect(url_for('index'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if not User(username).verify_password(password):
            flash('Invalid login.')
        else:
            session['username'] = username
            # flash('Logged in.')
            print(session)
            return redirect(url_for('index'))

    return render_template("user/login.html")


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = Password(request.form['password'])

        if len(username) < 3:
            flash("Your username must be at least 3 characters long.")
        elif password.password_complexity(no_complex=False):
            flash("Password must contain:" + ', '.join(password.conditions))
        elif not User(username).register(password):
            flash("User with {} already exists".format(username))
        else:
            session['username'] = username
            flash('Logged in.')
            return redirect(url_for('index'))

    return render_template("user/register.html")


@app.route('/add_post', methods=['GET', 'POST'])
def add_post():
    if request.method == 'GET':
        redirect(url_for('post_edit'))

    title = request.form['title']
    tags = request.form['tags']
    text = request.form['text']

    if not title:
        flash("You must fill the title.")
    elif not tags:
        flash("You must give at least one tag.")
    elif not text:
        flash("You must write some text.")
    elif not User(session['username']).add_post(title, tags, text):
        flash("The post with {title}, has been written today, you can write same tomorrow".format(title=title))

    return redirect(url_for('index'))


@app.route('/post_detail/<post_slug>')
def post_detail(post_slug):
    return render_template("post/post_detail.html")


@app.route('/post_editor', methods=['GET'])
def post_edit():
    return render_template("post/post_editor.html")

