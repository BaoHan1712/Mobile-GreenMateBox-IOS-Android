from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
from functools import wraps
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)
app.secret_key = "greenmate_secret_key_2025"
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

USER_FILE = "users.json"
LOG_FILE = "logs.txt"

# =============================
# DECORATOR - Check Login
# =============================
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_email' not in session:
            return redirect(url_for('home_page'))
        return f(*args, **kwargs)
    return decorated_function

# =============================
# HTML ROUTES
# =============================
@app.route('/')
def home_page():
    # Nếu đã đăng nhập rồi, chuyển sang home
    if 'user_email' in session:
        return redirect(url_for('login_page'))
    return render_template('login.html')

@app.route('/home')
@login_required
def login_page():
    return render_template('index.html')


# =============================
# HÀM LOAD / SAVE
# =============================
def load_users():
    if not os.path.exists(USER_FILE):
        return {}
    with open(USER_FILE, "r") as f:
        return json.load(f)


def save_users(users):
    with open(USER_FILE, "w") as f:
        json.dump(users, f, indent=4)


def write_log(message):
    with open(LOG_FILE, "a") as f:
        f.write(f"{datetime.now()} - {message}\n")


# =============================
# DATABASE TRONG RAM + FILE
# =============================
users_db = load_users()
transactions_db = []


# =============================
# LOGIN
# =============================
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        # Reload users từ file mỗi lần login (ensure fresh data)
        global users_db
        users_db = load_users()
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            write_log(f"LOGIN FAILED: Empty email/password")
            return jsonify({'success': False, 'message': 'Email và mật khẩu không được để trống'}), 400

        # Kiểm tra email tồn tại trong file
        if email not in users_db:
            write_log(f"LOGIN FAILED: Email không tồn tại - {email}")
            return jsonify({'success': False, 'message': 'Email này chưa được đăng ký. Vui lòng đăng ký tài khoản mới'}), 401

        # Kiểm tra mật khẩu đúng không
        if users_db[email]['password'] != password:
            write_log(f"LOGIN FAILED: Wrong password - {email}")
            return jsonify({'success': False, 'message': 'Mật khẩu không chính xác'}), 401

        # Thành công - Lưu session
        session.permanent = True
        session['user_email'] = email
        session['user_name'] = users_db[email]['name']
        session['user_points'] = users_db[email]['points']
        
        user_data = users_db[email]
        write_log(f"LOGIN SUCCESS: {email}")
        return jsonify({'success': True, 'user': user_data, 'redirect': '/home'}), 200

    except Exception as e:
        write_log(f"LOGIN ERROR: {str(e)}")
        return jsonify({'success': False, 'message': f'Lỗi, hãy thử đăng ký trước khi đăng nhập'}), 500


# =============================
# SIGNUP
# =============================
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        # Reload users từ file mỗi lần signup (ensure fresh data)
        global users_db
        users_db = load_users()
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            write_log(f"SIGNUP FAILED: Empty fields")
            return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ thông tin'}), 400

        # Kiểm tra email đã tồn tại chưa
        if email in users_db:
            write_log(f"SIGNUP FAILED: Email already exists - {email}")
            return jsonify({'success': False, 'message': 'Email này đã được đăng ký rồi. Hãy sử dụng email khác hoặc đăng nhập'}), 409

        # Kiểm tra mật khẩu
        if len(password) < 6:
            write_log(f"SIGNUP FAILED: Password too short - {email}")
            return jsonify({'success': False, 'message': 'Mật khẩu phải có ít nhất 6 ký tự'}), 400

        # Tạo user mới
        new_user = {
            'id': len(users_db) + 1,
            'email': email,
            'password': password,
            'name': name,
            'points': 500,
            'level': 'Tân binh - Level 1'
        }

        users_db[email] = new_user
        save_users(users_db)

        write_log(f"SIGNUP SUCCESS: {email}")

        return jsonify({'success': True, 'user': new_user, 'message': 'Đăng ký thành công!'}), 201

    except Exception as e:
        write_log(f"SIGNUP ERROR: {str(e)}")
        return jsonify({'success': False, 'message': f'Lỗi server: {str(e)}'}), 500


# =============================
# LOGOUT
# =============================
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    try:
        email = session.get('user_email', 'Unknown')
        session.clear()
        write_log(f"LOGOUT SUCCESS: {email}")
        return jsonify({'success': True, 'message': 'Đăng xuất thành công', 'redirect': '/'}), 200
    except Exception as e:
        write_log(f"LOGOUT ERROR: {str(e)}")
        return jsonify({'success': False, 'message': 'Lỗi đăng xuất'}), 500


# =============================
# GET USER INFO (Check Session)
# =============================
@app.route('/api/auth/user', methods=['GET'])
def get_user():
    if 'user_email' not in session:
        return jsonify({'success': False, 'message': 'Chưa đăng nhập'}), 401
    
    user_email = session.get('user_email')
    users_db = load_users()
    
    if user_email in users_db:
        user_data = users_db[user_email]
        return jsonify({'success': True, 'user': user_data}), 200
    
    return jsonify({'success': False, 'message': 'User không tìm thấy'}), 404


# =============================
# HEALTH CHECK
# =============================
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'Server GreenMate Box is running!'}), 200


# =============================
# MAIN
# =============================
if __name__ == '__main__':
    print("Server đang chạy ở http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
