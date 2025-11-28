#!/bin/bash

# Replace business info localStorage with API calls
sed -i "s/localStorage\.getItem('businessPhone')/await fetch('\/api\/business-info').then(r => r.json()).then(d => d.phone)/g" index.html
sed -i "s/localStorage\.getItem('businessEmail')/await fetch('\/api\/business-info').then(r => r.json()).then(d => d.email)/g" index.html
sed -i "s/localStorage\.getItem('businessWebsite')/await fetch('\/api\/business-info').then(r => r.json()).then(d => d.website)/g" index.html

# Replace defaultMargin localStorage
sed -i "s/localStorage\.getItem('defaultMargin')/await fetch('\/api\/business-info').then(r => r.json()).then(d => d.default_margin || 30)/g" index.html

echo "LocalStorage replacement complete"
