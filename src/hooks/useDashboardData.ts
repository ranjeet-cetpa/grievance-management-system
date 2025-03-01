import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import moment from 'moment';

/**
 * Custom hook to fetch holiday and dashboard data.
 */
const useDashboardData = () => {
  const [loading, setLoading] = useState(false);
  const [employeeHolidaysList, setEmployeeHolidaysList] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [visitorEvents, setVisitorEvents] = useState([]);

  const user = useSelector((state: RootState) => state.user);

  /**
   * Fetch holiday data for the current user's unit.
   */
  const fetchHolidayData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance('/Admin/GetAllHolidays');
      const filteredHolidays = response?.data?.data?.filter(
        (holiday) => Number(holiday.unitId) === Number(user.unitId)
      );
      setEmployeeHolidaysList(filteredHolidays);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  }, [user.unitId]);

  const fetchVisitorEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/VisitorMangement/GetAcceptedVisitors/${user.EmpCode}`);

      const formattedMeetings = response?.data?.data.map((visitor) => {
        const meetDate = moment(visitor.meetDate).format('YYYY-MM-DD');
        const start = moment(`${meetDate} ${visitor.inTime}`, 'YYYY-MM-DD HH:mm:ss').toDate();
        const end = moment(`${meetDate} ${visitor.outTime}`, 'YYYY-MM-DD HH:mm:ss').toDate();

        return {
          title: `${visitor.firstName} ${visitor.lastName} - ${visitor.purposeOfVisit}`,
          start,
          end,
          allDay: false,
          isHoliday: false, // Marking as a normal event
        };
      });
      setVisitorEvents(formattedMeetings);
    } catch (error) {
      console.error('Error fetching visitor events:', error);
    } finally {
      setLoading(false);
    }
  }, [user.EmpCode]);

  /**
   * Fetch dashboard statistics data.
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance(`/Admin/GetDeshboardData/${user.EmpCode}/${user.unitId}`);
      setDashboardData(response.data.data || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user.EmpCode, user.unitId]);

  /**
   * Load data when user unit changes.
   */
  useEffect(() => {
    if (user.unitId) {
      fetchHolidayData();
      fetchDashboardData();
      fetchVisitorEvents();
    }
  }, [user.unitId, fetchHolidayData, fetchDashboardData, fetchVisitorEvents]);

  return { loading, employeeHolidaysList, dashboardData, visitorEvents };
};

export default useDashboardData;
