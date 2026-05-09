import os, zipfile, json, shutil

MODEL_PATH = r"C:\wamp64\www\deepcare-WebApp\python_ai\skin_disease_efficientnetb0_v2.keras"
OUTPUT_PATH = r"C:\wamp64\www\deepcare-WebApp\python_ai\skin_disease_efficientnetb0_v2_fixed.keras"

shutil.copy(MODEL_PATH, OUTPUT_PATH)

with zipfile.ZipFile(OUTPUT_PATH, 'r') as z:
    names = z.namelist()
    config_name = next((n for n in names if 'config.json' in n), None)
    if not config_name:
        print("ERROR: config.json not found"); exit(1)
    config = json.loads(z.read(config_name).decode('utf-8'))

def strip_renorm(obj):
    if isinstance(obj, dict):
        for k in ['renorm', 'renorm_clipping', 'renorm_momentum', 'quantization_config']:
            obj.pop(k, None)
        for v in obj.values():
            strip_renorm(v)
    elif isinstance(obj, list):
        for item in obj:
            strip_renorm(item)

strip_renorm(config)
fixed_json = json.dumps(config)

tmp_path = OUTPUT_PATH + ".tmp"
with zipfile.ZipFile(OUTPUT_PATH, 'r') as zin:
    with zipfile.ZipFile(tmp_path, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            if item.filename == config_name:
                zout.writestr(item, fixed_json)
            else:
                zout.writestr(item, zin.read(item.filename))

os.replace(tmp_path, OUTPUT_PATH)
print("Done! Patched model saved to:", OUTPUT_PATH)