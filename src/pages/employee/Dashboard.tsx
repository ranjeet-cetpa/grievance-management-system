import { Card, CardHeader, CardContent } from "@/components/ui/card"
import Heading from "@/components/ui/heading"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { AlertCircle, Clock, CheckCircle2, MessageCircle, TimerReset } from "lucide-react"
import React from 'react'

// Mock data - replace with actual data from your API
const grievanceChartData = [
  { name: "Jan", total: 2 },
  { name: "Feb", total: 1 },
  { name: "Mar", total: 0 },
  { name: "Apr", total: 3 },
  { name: "May", total: 10 },
  { name: "Jun", total: 2 },
]

const Dashboard = () => {
  return (
    <div className="p-4 space-y-4">
      <Heading type={4}>My Grievances Dashboard</Heading>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">Total Submitted</p>
              <p className="text-2xl font-bold text-black">9</p>
            </div>
            <AlertCircle className="h-6 w-6 text-black" />
          </CardHeader>
        </Card>

        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in [animation-delay:300ms] bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">In Progress</p>
              <p className="text-2xl font-bold text-black">2</p>
            </div>
            <Clock className="h-6 w-6 text-orange-500" />
          </CardHeader>
        </Card>

        <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in [animation-delay:400ms] bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-black">Resolved</p>
              <p className="text-2xl font-bold text-black">6</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </CardHeader>
        </Card>
      </div>

      {/* Charts and Additional Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Heading type={5}>My Grievances History</Heading>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={grievanceChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar
                  dataKey="total"
                  fill="#0D56C5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Heading type={5}>My Recent Grievances</Heading>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Work Schedule Adjustment Request",
                  date: "2024-03-15",
                  status: "Under Review",
                  statusColor: "bg-yellow-500",
                  lastUpdate: "HR reviewing your request"
                },
                {
                  title: "Training Opportunity Request",
                  date: "2024-03-10",
                  status: "In Progress",
                  statusColor: "bg-blue-500",
                  lastUpdate: "Meeting scheduled with department head"
                },
                {
                  title: "Equipment Request",
                  date: "2024-03-05",
                  status: "Resolved",
                  statusColor: "bg-green-500",
                  lastUpdate: "New laptop approved"
                }
              ].map((grievance, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                  <div className={`w-2 h-2 rounded-full ${grievance.statusColor}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{grievance.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {grievance.date}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: <span className="font-medium">{grievance.status}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {grievance.lastUpdate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard