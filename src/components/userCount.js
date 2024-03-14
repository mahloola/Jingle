import React, { useState, useEffect } from 'react';
import { google } from 'googleapis';

function AnalyticsComponent() {
    const [totalUsers, setTotalUsers] = useState(null);

    useEffect(() => {
        async function fetchAnalyticsData() {
            try {
                const jwtClient = new google.auth.JWT(
                    process.env.GOOGLE_CLIENT_EMAIL,
                    null,
                    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    ['https://www.googleapis.com/auth/analytics.readonly']
                );

                await jwtClient.authorize();
                const analyticsreporting = google.analyticsreporting({
                    version: 'v4',
                    auth: jwtClient,
                });

                const res = await analyticsreporting.reports.batchGet({
                    requestBody: {
                        reportRequests: [
                            {
                                viewId: 'YOUR_VIEW_ID',
                                dateRanges: [
                                    {
                                        startDate: '7daysAgo',
                                        endDate: 'today',
                                    },
                                ],
                                metrics: [{ expression: 'ga:users' }],
                            },
                        ],
                    },
                });

                const totalUsers = res.data.reports[0].data.totals[0].values[0];
                setTotalUsers(totalUsers);
            } catch (error) {
                console.error('Error fetching Analytics data:', error);
            }
        }

        fetchAnalyticsData();
    }, []);

    return (
        <div>
            <h2>Total Unique Users: {totalUsers}</h2>
        </div>
    );
}

export default AnalyticsComponent;
