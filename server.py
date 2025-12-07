from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

USER_FILE = "users.json"
LOG_FILE = "logs.txt"


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

        # Thành công
        user_data = users_db[email]
        write_log(f"LOGIN SUCCESS: {email}")
        return jsonify({'success': True, 'user': user_data}), 200

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
