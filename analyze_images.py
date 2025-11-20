#!/usr/bin/env python3
import os
from PIL import Image
import base64
import json

def analyze_images():
    uploads_dir = "/root/food-truck-app/public/uploads"
    results = []
    
    for filename in os.listdir(uploads_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
            filepath = os.path.join(uploads_dir, filename)
            try:
                with Image.open(filepath) as img:
                    # Get basic info
                    width, height = img.size
                    mode = img.mode
                    
                    # Convert to RGB if needed and resize for analysis
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # Resize to small thumbnail for color analysis
                    thumb = img.resize((50, 50))
                    pixels = list(thumb.getdata())
                    
                    # Get dominant colors (simplified)
                    colors = {}
                    for pixel in pixels:
                        color_key = f"rgb({pixel[0]},{pixel[1]},{pixel[2]})"
                        colors[color_key] = colors.get(color_key, 0) + 1
                    
                    # Get top 5 colors
                    top_colors = sorted(colors.items(), key=lambda x: x[1], reverse=True)[:5]
                    
                    results.append({
                        'filename': filename,
                        'dimensions': f"{width}x{height}",
                        'mode': mode,
                        'dominant_colors': [color[0] for color in top_colors],
                        'aspect_ratio': round(width/height, 2)
                    })
                    
            except Exception as e:
                results.append({
                    'filename': filename,
                    'error': str(e)
                })
    
    return results

if __name__ == "__main__":
    try:
        results = analyze_images()
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"Error: {e}")