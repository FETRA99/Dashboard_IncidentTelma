import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './Dashboard.css';
import mockIncidents from './mockData'; // Importer les données fictives

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [priorityData, setPriorityData] = useState([]);
  const [platformData, setPlatformData] = useState([]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://tapp597lv:3132/incidents');
      setIncidents(response.data);
      setFilteredIncidents(response.data);
      filterLastMonth(response.data);
    } catch (error) {
      console.error("API not available, using mock data", error);
      setIncidents(mockIncidents);
      setFilteredIncidents(mockIncidents);
      filterLastMonth(mockIncidents);
    }
  };

  const filterLastMonth = (data) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const filtered = data.filter(incident => new Date(incident.hdeb) >= lastMonth);
    setFilteredIncidents(filtered);
    prepareData(filtered);
  };

  const prepareData = (data) => {
    const priorityCounts = data.reduce((acc, incident) => {
      acc[incident.priorite] = (acc[incident.priorite] || 0) + 1;
      return acc;
    }, {});

    const platformCounts = data.reduce((acc, incident) => {
      acc[incident.plateforme] = (acc[incident.plateforme] || 0) + 1;
      return acc;
    }, {});

    setPriorityData(Object.keys(priorityCounts).map(key => ({ name: key, value: priorityCounts[key] })));
    setPlatformData(Object.keys(platformCounts).map(key => ({ name: key, value: platformCounts[key] })));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="dashboard">
      <h1>Incident Dashboard</h1>
      <div className="filters">
        <label>
          Statut:
          <select onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tous</option>
            <option value="en attente">En attente</option>
            <option value="résolu">Résolu</option>
          </select>
        </label>
        <label>
          Plateforme:
          <select onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="">Tous</option>
            {incidents.map(incident => (
              <option key={incident.plateforme} value={incident.plateforme}>{incident.plateforme}</option>
            ))}
          </select>
        </label>
        <label>
          Date:
          <input type="date" onChange={(e) => setDateFilter(e.target.value)} />
        </label>
      </div>
      <div className="chart-container">
        <div>
          <h2>Incidents par Priorité</h2>
          <PieChart width={400} height={400}>
            <Pie
              data={priorityData}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>
        <div>
          <h2>Incidents par Plateforme</h2>
          <BarChart
            width={600}
            height={300}
            data={platformData}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
