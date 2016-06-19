from blog import app
import os

app.secret_key = os.urandom(24)
app.config['DEBUG'] = True
port = int(os.environ.get('PORT', 5000))
app.run(host='localhost', port=port)
