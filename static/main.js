(function () {
    const parts = window.location.pathname.split("/"),
        server = parts[2],
        type = parts[3];

    $('#type').text(type);

    const table = $('#hours'),
        current = currentWeek(),
        validAfter = 1636934399; // Sun Nov 14 2021 23:59:59 GMT+0000

    $.get('/duty/' + server + '/' + type + '/api', function (data) {
        if (data.status) {
            if (data.result.length > 0) {
                let html = buildHeader();

                data.result = data.result.sort(cmp)

                $.each(data.result, function (_, person) {
                    const info = person.firstName + ' ' + person.lastName + ' (#' + person.id + ')';
                    const thisWeek = person.onDutyTime[current + ''];

                    const cls = thisWeek === 0 ? (sum(person.onDutyTime) === 0 ? 'invalid' : 'inactive') : (thisWeek >= (4 * 60 * 60) ? 'active' : 'semi');

                    let p = '<tr class="' + cls + '"><td title="' + info + '">' + info + '</td>';

                    for (let week = current; week > current - 5; week--) {
                        const d = week + '' in person.onDutyTime ? person.onDutyTime[week + ''] : null;

                        if (moment().utc().day("Monday").isoWeek(week).unix() < validAfter) {
                            p += '<td>N/A</td>';
                        } else {
                            p += '<td>' + formatSeconds(d) + '</td>';
                        }
                    }

                    html += p + '</tr>';
                });

                table.html(html);
            } else {
                table.html('<tr><th>No data available</th></tr>');
            }
        } else {
            table.html('<tr><th>' + data.message + '</th></tr>');
        }
    });

    function sum(hours) {
        let s = 0;

        $.each(hours, function (key, h) {
            s += h;
        });

        return s;
    }

    function formatSeconds(seconds) {
        if (seconds === null) {
            return 'N/A';
        }

        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        let hours = Math.floor(minutes / 60);
        minutes -= hours * 60;

        let formatted = '';

        if (hours > 0) {
            formatted = hours + ' hour(s) and ';
        }

        return formatted + minutes + ' minutes';
    }

    function buildHeader() {
        const current = currentWeek();

        let header = '<tr><th>Person</th>';

        for (let week = current; week > current - 5; week--) {
            header += '<th>' + getDateRange(week) + '</th>';
        }

        return header + '</tr>';
    }

    function currentWeek() {
        return moment().utc().isoWeek();
    }

    function getDateRange(week) {
        week = parseInt(week);

        if (week === currentWeek()) {
            return "This week";
        } else if (week === currentWeek() - 1) {
            return "Last week";
        }

        return moment().utc().day("Monday").isoWeek(week).format('DD.MM.YYYY') + " - " + moment().utc().day("Sunday").isoWeek(week).format('DD.MM.YYYY');
    }

    function cmp(a, b) {
        const thisA = a.onDutyTime[current + ''],
            thisB = b.onDutyTime[current + ''];

        if (thisA === thisB) {
            const lastA = a.onDutyTime[(current - 1) + ''],
                lastB = b.onDutyTime[(current - 1) + ''];

            if (lastA === lastB) {
                const sumA = sum(a.onDutyTime),
                    sumB = sum(b.onDutyTime);

                if (sumA === sumB) {
                    return a.firstName.localeCompare(b.firstName) ? 1 : -1;
                }

                return sumA < sumB ? 1 : -1;
            }

            return lastA < lastB ? 1 : -1;
        }

        return thisA < thisB ? 1 : -1;
    }
})()