document.addEventListener("DOMContentLoaded", () => {
    // API URL base
    const API_URL = "http://localhost:5000/api";
    
    // Check authentication token
    const token = localStorage.getItem("token");
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = "index.html";
        return;
    }
    
    // Set up Auth header for API requests
    const authHeader = { 'Authorization': 'Bearer ' + token };
    
    // Load dark mode preference
    if (localStorage.getItem("dark-mode") === "enabled") {
        document.body.classList.add("dark-mode");
        document.querySelectorAll("header, nav a, button, .job-table").forEach(el => el.classList.add("dark-mode"));
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            document.querySelectorAll("header, nav a, button, .job-table").forEach(el => el.classList.toggle("dark-mode"));

            if (document.body.classList.contains("dark-mode")) {
                localStorage.setItem("dark-mode", "enabled");
            } else {
                localStorage.setItem("dark-mode", "disabled");
            }
        });
    }
    
    // Load dashboard data
    loadDashboardData();
    loadRecentJobs();
    
    // Dashboard data loading function
    async function loadDashboardData() {
        try {
            const response = await fetch(`${API_URL}/dashboard`, {
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update statistics
                document.getElementById('total-jobs').textContent = data.stats.total_jobs;
                document.getElementById('applied-count').textContent = data.stats.applied;
                document.getElementById('interview-count').textContent = data.stats.interview;
                document.getElementById('rejected-count').textContent = data.stats.rejected;
                
                // Update deadlines
                updateDeadlinesList(data.stats.upcoming_deadlines);
                
                // Create charts
                createStatusChart(data.stats);
            } else {
                console.error("Failed to load dashboard data:", data.message);
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        }
    }
    
    // Function to update deadlines list
    function updateDeadlinesList(deadlines) {
        const deadlinesList = document.getElementById('deadline-list');
        const noDeadlinesMsg = document.getElementById('no-deadlines');
        
        if (deadlines.length === 0) {
            noDeadlinesMsg.style.display = 'block';
            return;
        }
        
        noDeadlinesMsg.style.display = 'none';
        deadlinesList.innerHTML = '';
        
        deadlines.forEach(job => {
            const deadline = new Date(job.deadline_date);
            const today = new Date();
            const daysRemaining = job.days_remaining;
            
            const deadlineItem = document.createElement('div');
            deadlineItem.className = 'deadline-item';
            
            const isUrgent = daysRemaining <= 2;
            
            deadlineItem.innerHTML = `
                <div>
                    <strong>${job.title}</strong> at ${job.company}
                </div>
                <div class="${isUrgent ? 'deadline-warning' : ''}">
                    ${formatDate(job.deadline_date)} (${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left)
                </div>
            `;
            
            deadlinesList.appendChild(deadlineItem);
        });
    }
    
    // Load recent jobs
    async function loadRecentJobs() {
        try {
            const response = await fetch(`${API_URL}/jobs?limit=5`, {
                headers: {
                    ...authHeader,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                updateRecentJobsList(data.jobs);
                createTimelineChart(data.jobs);
            } else {
                console.error("Failed to load recent jobs:", data.message);
            }
        } catch (error) {
            console.error("Error loading recent jobs:", error);
        }
    }
    
    // Function to update recent jobs list
    function updateRecentJobsList(jobs) {
        const recentJobsList = document.getElementById('recent-jobs-list');
        recentJobsList.innerHTML = '';
        
        if (jobs.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" style="text-align: center;">No job applications yet</td>';
            recentJobsList.appendChild(row);
            return;
        }
        
        jobs.slice(0, 5).forEach(job => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${job.title}</td>
                <td>${job.company}</td>
                <td>${formatDate(job.application_date)}</td>
                <td>
                    <span class="status-badge status-${job.status}">${capitalizeFirstLetter(job.status)}</span>
                </td>
                <td>
                    <a href="home.html" class="view-btn">View Details</a>
                </td>
            `;
            
            recentJobsList.appendChild(row);
        });
    }
    
    // Function to create status chart
    function createStatusChart(stats) {
        const ctx = document.getElementById('status-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Applied', 'Interview', 'Rejected'],
                datasets: [{
                    data: [stats.applied, stats.interview, stats.rejected],
                    backgroundColor: [
                        '#4a90e2',  // Blue for applied
                        '#50c878',  // Green for interview
                        '#e74c3c'   // Red for rejected
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Application Status Distribution',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
    
    // Function to create timeline chart
    function createTimelineChart(jobs) {
        // Group jobs by month
        const jobsByMonth = {};
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        
        // Initialize all months with zero counts
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            jobsByMonth[monthYear] = { applied: 0, interview: 0, rejected: 0 };
        }
        
        // Count jobs by month and status
        jobs.forEach(job => {
            const jobDate = new Date(job.application_date);
            
            // Only include jobs from the last 6 months
            if (jobDate >= sixMonthsAgo) {
                const monthYear = `${jobDate.toLocaleString('default', { month: 'short' })} ${jobDate.getFullYear()}`;
                
                if (jobsByMonth[monthYear]) {
                    jobsByMonth[monthYear][job.status]++;
                }
            }
        });
        
        // Prepare data for chart
        const labels = Object.keys(jobsByMonth).reverse();
        const appliedData = labels.map(month => jobsByMonth[month].applied);
        const interviewData = labels.map(month => jobsByMonth[month].interview);
        const rejectedData = labels.map(month => jobsByMonth[month].rejected);
        
        const ctx = document.getElementById('timeline-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Applied',
                        data: appliedData,
                        backgroundColor: '#4a90e2',
                        borderWidth: 1
                    },
                    {
                        label: 'Interview',
                        data: interviewData,
                        backgroundColor: '#50c878',
                        borderWidth: 1
                    },
                    {
                        label: 'Rejected',
                        data: rejectedData,
                        backgroundColor: '#e74c3c',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Job Applications Timeline',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});