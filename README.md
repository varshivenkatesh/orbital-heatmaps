# 🛰️ Space Traffic Navigation

[![Live Demo](https://img.shields.io/badge/Live_Site-Click_Here-brightgreen)](https://varshivenkatesh.github.io/space-traffic-nav/)

An interactive platform for **satellite traffic visualization and analytics**. Initially developed during **Women in Data - Space Aware Datathon 2025**.
I reimplemented this project end-to-end individually - this extracts **Unified Data Library (UDL) bulk data** and **Space-Track.org JSON data**, processes and maps them into **GeoJSON**, and visualizes satellite traffic in **2D maps** and **3D globes** with advanced analytics through **Google Looker Studio**.

---

## Features
- **Data Pipeline**
  - Extracts **UDL Bulk Data** from **Google Drive**.
  - Integrates **Space-Track.org** JSON data.
  - Normalizes and maps JSON into **GeoJSON** format.
  - Visualizes GeoJSON data in an interactive web app with **THREE.js** and **Leaflet.js**.
  - Pushes DataFrames into **Google BigQuery** for scalable storage and queries.
  - Connects BigQuery to **Looker Studio** for dashboards and analytics.

- **Visualization**
  - **2D Maps** using [Leaflet.js](https://leafletjs.com/)  
  - **3D Globes** using [THREE.js](https://threejs.org/)  
  - Filters, search, and risk classification for conjunctions  
  - Direct access to Looker Studio dashboards from the live site  

---

## Data Sources
- **Conjunctions** → Satellite conjunction/risk events (UDL + Space-Track)  
- **Elset** → Orbital elements (apogee, perigee, inclination, semi-major axis, etc.)  
- **SGI** → Space weather indices (F10.7, AP, solar activity)  
- **State Vectors** → Satellite position and velocity parameters  

---

## Tech Stack
- **Data Processing**: Google Colab, Python, Pandas  
- **Storage & Analytics**: Google BigQuery, Looker Studio  
- **Frontend Visualization**:  
  - [Leaflet.js](https://leafletjs.com/) → 2D mapping  
  - [THREE.js](https://threejs.org/) → 3D orbital visualization  
  - Hosted with **GitHub Pages**

---

<img width="2000" height="600" alt="pipeline" src="https://github.com/user-attachments/assets/20370625-adc9-42ce-918d-b4809e8ec97b" />

---

## 🌐 Live Site
🔗 [Space Traffic Navigation Website](https://varshivenkatesh.github.io/space-traffic-nav/)

---

## 📌 Future Enhancements
- Real-time satellite feeds from Space-Track API integration  
- Orbital density heatmaps for congestion analysis  
- Deeper Looker Studio dashboards with automated aggregation  
