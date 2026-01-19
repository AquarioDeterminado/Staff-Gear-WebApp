import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardService from "../../services/DashboardService";

const DashboardComponent = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getProfileDashboard();
      console.log("[DBG] Dashboard data received:", data);
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error("[ERR] Erro ao buscar dashboard:", err);
      setError("Erro ao carregar o dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!dashboard) {
    return <Alert severity="warning">Nenhum dado de dashboard disponível</Alert>;
  }

  const chartData = dashboard.paymentHistory || [];

  const formatPayFrequency = (frequency) => {
    if (frequency === 1) return "Monthly";
    if (frequency === 2) return "Bi-weekly";
    return "N/A";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Card sx={{ mb: 3, bgcolor: "#2c3e50", color: "white" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
            Payment Promotions
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.7)"
                style={{ fontSize: "0.875rem" }}
              />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a252f",
                  border: "1px solid #4a90e2",
                  borderRadius: "4px",
                }}
                labelStyle={{ color: "white" }}
                formatter={(value) => [formatCurrency(value), "Rate"]}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    const year = payload[0].payload.year;
                    return `${label} ${year}`;
                  }
                  return label;
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#4a90e2"
                strokeWidth={2}
                dot={{ fill: "#4a90e2", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", border: "2px solid #e0e0e0" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                Last Salary (Approx.)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4a90e2" }}>
                {dashboard.lastSalary ? formatCurrency(dashboard.lastSalary * 160) : "N/A"}
              </Typography>
              <Typography color="textSecondary" sx={{ fontSize: "0.75rem", mt: 1 }}>
                Monthly Average
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", border: "2px solid #e0e0e0" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                Last Pay Frequency
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4a90e2" }}>
                {dashboard.lastPayFrequency ? formatPayFrequency(dashboard.lastPayFrequency) : "N/A"}
              </Typography>
              <Typography color="textSecondary" sx={{ fontSize: "0.75rem", mt: 1 }}>
                Payment Schedule
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", border: "2px solid #e0e0e0" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                Rate Change Date
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4a90e2" }}>
                {dashboard.raiseChangeDate ? formatDate(dashboard.raiseChangeDate) : "N/A"}
              </Typography>
              <Typography color="textSecondary" sx={{ fontSize: "0.75rem", mt: 1 }}>
                Last Update
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%", border: "2px solid #e0e0e0" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                Days on Department
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#4a90e2" }}>
                {dashboard.daysOnDepartment || 0}
              </Typography>
              <Typography color="textSecondary" sx={{ fontSize: "0.75rem", mt: 1 }}>
                Current Department
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: "#e3f2fd", border: "2px solid #4a90e2" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#4a90e2", textAlign: "center" }}>
            You have been {dashboard.daysOnDepartment || 0} days on your{" "}
            {dashboard.currentDepartment || "current"} department!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardComponent;
