from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Mock database
users_db = {}
transactions_db = []

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email và mật khẩu không được để trống'}), 400
        
        # Mock validation
        if email in users_db and users_db[email]['password'] == password:
            user = users_db[email]
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user['name'],
                    'points': user['points'],
                    'level': user['level']
                }
            }), 200
        else:
            # Auto-register if doesn't exist (for demo)
            if email not in users_db:
                users_db[email] = {
                    'id': len(users_db) + 1,
                    'email': email,
                    'password': password,
                    'name': 'GreenMate User',
                    'points': 1280,
                    'level': 'Eco Warrior - Level 10'
                }
                return jsonify({
                    'success': True,
                    'user': users_db[email]
                }), 201
            else:
                return jsonify({'success': False, 'message': 'Mật khẩu không chính xác'}), 401
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Signup endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        
        if not email or not password or not name:
            return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ thông tin'}), 400
        
        if email in users_db:
            return jsonify({'success': False, 'message': 'Email đã được đăng ký'}), 409
        
        # Create new user
        new_user = {
            'id': len(users_db) + 1,
            'email': email,
            'password': password,
            'name': name,
            'points': 500,
            'level': 'Tân binh - Level 1'
        }
        
        users_db[email] = new_user
        
        return jsonify({
            'success': True,
            'message': 'Đăng ký thành công!',
            'user': new_user
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/stats', methods=['GET'])
def get_stats():
    """Get user statistics"""
    try:
        email = request.headers.get('Authorization')
        
        if not email or email not in users_db:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        stats = {
            'totalExchanges': 42,
            'weeklyGrowth': '+12%',
            'ranking': 'Top 5',
            'bottles': 198,
            'cans': 127,
            'co2Saved': 52.3,
            'treesSaved': 26,
            'thisWeek': [
                {'day': 'T2', 'value': 45},
                {'day': 'T3', 'value': 62},
                {'day': 'T4', 'value': 58},
                {'day': 'T5', 'value': 78},
                {'day': 'T6', 'value': 85},
                {'day': 'T7', 'value': 72},
                {'day': 'CN', 'value': 90}
            ]
        }
        
        return jsonify({'success': True, 'stats': stats}), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/redeem', methods=['POST'])
def redeem_gift():
    """Redeem gift endpoint"""
    try:
        data = request.get_json()
        email = request.headers.get('Authorization')
        gift_name = data.get('giftName')
        cost = data.get('cost')
        
        if not email or email not in users_db:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        user = users_db[email]
        
        if user['points'] < cost:
            return jsonify({'success': False, 'message': 'Không đủ Eco để đổi quà'}), 400
        
        user['points'] -= cost
        
        # Log transaction
        transaction = {
            'id': len(transactions_db) + 1,
            'type': 'Đổi quà',
            'item': gift_name,
            'points': cost,
            'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
            'status': 'Hoàn tất'
        }
        transactions_db.append(transaction)
        
        return jsonify({
            'success': True,
            'message': f'Đã đổi {gift_name} thành công!',
            'newPoints': user['points']
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/user/scan', methods=['POST'])
def scan_qr():
    """Scan QR code endpoint"""
    try:
        email = request.headers.get('Authorization')
        
        if not email or email not in users_db:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        user = users_db[email]
        
        # Mock scan result
        import random
        bottles = random.randint(1, 5)
        cans = random.randint(1, 3)
        points = (bottles * 5) + (cans * 3)
        co2 = round((bottles * 0.08) + (cans * 0.15), 2)
        
        user['points'] += points
        
        # Log transaction
        transaction = {
            'id': len(transactions_db) + 1,
            'type': 'Hoạt động',
            'item': f'Quét {bottles} chai, {cans} lon',
            'points': points,
            'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
            'status': 'Hoàn tất'
        }
        transactions_db.append(transaction)
        
        return jsonify({
            'success': True,
            'result': {
                'bottles': bottles,
                'cans': cans,
                'points': points,
                'co2': co2
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'Server GreenMate Box is running!'}), 200

if __name__ == '__main__':
    print("🌱 GreenMate Box Server đang chạy...")
    print("📱 API URL: http://localhost:5000")
    print("✅ CORS enabled - App có thể kết nối từ bất kỳ origin nào")
    app.run(debug=True, host='0.0.0.0', port=5000)
