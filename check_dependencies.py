import os
import json
import re

def get_imports_from_file(filepath):
    imports = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Match import ... from '...'
            matches = re.findall(r'import\s+.*?from\s+[\'"](.*?)[\'"]', content, re.DOTALL)
            for m in matches:
                imports.add(m)
            # Match require('...')
            matches_req = re.findall(r'require\(\s*[\'"](.*?)[\'"]\s*\)', content)
            for m in matches_req:
                imports.add(m)
            # Match import('...')
            matches_dyn = re.findall(r'import\(\s*[\'"](.*?)[\'"]\s*\)', content)
            for m in matches_dyn:
                imports.add(m)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return imports

def get_package_name(import_path):
    if import_path.startswith('.'):
        return None
    if import_path.startswith('/'):
        return None
    
    parts = import_path.split('/')
    if import_path.startswith('@'):
        if len(parts) >= 2:
            return f"{parts[0]}/{parts[1]}"
    else:
        if len(parts) >= 1:
            return parts[0]
    return import_path

def main():
    # Load package.json
    try:
        with open('package.json', 'r') as f:
            pkg_data = json.load(f)
            dependencies = set(pkg_data.get('dependencies', {}).keys())
            devDependencies = set(pkg_data.get('devDependencies', {}).keys())
            all_deps = dependencies.union(devDependencies)
    except FileNotFoundError:
        print("package.json not found")
        return

    # Built-in or specially handled packages (polyfills usually added to pkg.json anyway if needed)
    ignored_packages = {
        'react', 'react-native', 'prop-types',
        'process', 'buffer', 'stream', 'events', 'util', 'path', 'fs', 'crypto' 
        # Note: React Native environment doesn't have these built-in, so they SHOULD be polyfilled/installed if used.
        # But for 'react' and 'react-native' deeply, we can assume they are there.
    }

    used_packages = set()

    # Walk src
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                raw_imports = get_imports_from_file(filepath)
                for imp in raw_imports:
                    pkg = get_package_name(imp)
                    if pkg and pkg not in ignored_packages:
                        used_packages.add(pkg)
    
    # Check index.js and App.tsx too
    for file in ['index.js', 'App.tsx']:
        if os.path.exists(file):
            raw_imports = get_imports_from_file(file)
            for imp in raw_imports:
                pkg = get_package_name(imp)
                if pkg and pkg not in ignored_packages:
                    used_packages.add(pkg)

    print("\n--- Usage Analysis ---")
    missing = []
    
    # We also check that the package is in package.json
    # Note: Some imports might be subpaths, e.g. "react-native-gesture-handler" vs "react-native-gesture-handler/Drawer"
    # get_package_name handles basics.

    for pkg in sorted(used_packages):
        if pkg not in all_deps:
            # Check if it is a built-in alias or handled by another package? 
            # Or maybe checking mapped names
            if pkg == 'react-native-blob-util': # It is installed as react-native-blob-util
                pass 
            elif pkg == 'text-encoding': # Installed
                pass
            elif pkg in ['stream-browserify']: # Installed
                pass
            else:
                 missing.append(pkg)

    if missing:
        print("POSSIBLE MISSING DEPENDENCIES:")
        for m in missing:
            print(f" - {m}")
    else:
        print("No missing dependencies found based on static import analysis.")

if __name__ == '__main__':
    main()
