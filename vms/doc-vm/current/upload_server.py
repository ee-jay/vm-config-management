from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Set your target directory
TARGET_DIR = "/mnt/paperless_storage_ssd/consume"  # Change this to your actual directory

@app.route('/upload', methods=['POST'])
def upload_file():
    print('--- Debug: request.files ---')
    print(request.files)
    print('--- Debug: request.form ---')
    print(request.form)
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    # Save the file
    file.save(os.path.join(TARGET_DIR, file.filename))
    return jsonify({'success': True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 