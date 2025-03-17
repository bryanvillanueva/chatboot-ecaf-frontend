import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from '../components/Navbar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CACHE_KEY = 'dashboardData';
const CACHE_EXPIRATION = 5 * 60 * 1000;

const Dashboard = ({ pageTitle }) => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('https://webhook-ecaf-production.up.railway.app/api/dashboard-info');
        const data = response.data;
        setDashboardData(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      } catch (error) {
        console.error('Error fetching dashboard info:', error);
      }
    };

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < CACHE_EXPIRATION) {
        setDashboardData(parsedCache.data);
        return;
      }
    }
    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="primary" gutterBottom>
          Cargando información del dashboard...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  const { total_mensajes, mensajes_sharky, total_usuarios, mensajes_pendientes, timeline } = dashboardData;
  const mensajesEnviados = mensajes_sharky;
  const mensajesRecibidos = total_mensajes - mensajes_sharky;

  const stats = [
    { label: 'Mensajes enviados', value: mensajesEnviados },
    { label: 'Mensajes recibidos', value: mensajesRecibidos },
    { label: 'Mensajes pendientes', value: mensajes_pendientes },
    { label: 'Usuarios activos', value: total_usuarios },
  ];

  const chartData = {
    labels: timeline ? timeline.map(item => item.date) : [],
    datasets: [
      {
        label: 'Mensajes recibidos',
        data: timeline ? timeline.map(item => item.count) : [],
        borderColor: '#ed403d',
        backgroundColor: '#ed403dad',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <Box>
      <Navbar pageTitle={pageTitle} />
      <Box p={3} sx={{ marginTop: '10px' }}>

        <Grid container spacing={1} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={3} sx={{ textAlign: 'center', padding: '5px' }}>
                <CardContent>
                  <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box mt={1}>
          <Card elevation={3}>
            <CardContent>
              <Line data={chartData}  height={100} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Timeline global de mensajes recibidos' } } }} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
