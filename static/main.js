(function () {
    const parts = window.location.pathname.split("/"),
        server = parts[2],
        type = parts[3];

    $('#type').text(type);

    const table = $('#hours'),
        weekZero = 1609113600,
        current = currentWeek();

	function resolve(pTime) {
		if (typeof pTime === 'object') {
			return pTime.normal + pTime.undercover;
		}

		return pTime;
	}

    $.get('/duty/' + server + '/' + type + '/api', function (data) {
        if (data.status) {
            if (data.result.length > 0) {
                let html = buildHeader();

                data.result = data.result.sort(cmp);

                $.each(data.result, function (_, person) {
                    const info = person.firstName + ' ' + person.lastName + ' (#' + person.id + ')';
                    const thisWeek = resolve(person.onDutyTime[current + '']);
                    const sumWeek = sum(person.onDutyTime);

                    let p = '<tr><td title="' + info + '" class="' + activeClass(thisWeek, sumWeek) + '">' + info + '</td>';

                    for (let week = current; week > current - 5; week--) {
                        const d = week + '' in person.onDutyTime ? resolve(person.onDutyTime[week + '']) : null;

                        if (d === undefined || d === null) {
                            p += '<td class="' + activeClass(d, sumWeek) + '">N/A</td>';
                        } else {
                            p += '<td class="' + activeClass(d, sumWeek) + '">' + formatSeconds(d) + '</td>';
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

    function activeClass(thisWeek, sumWeek) {
        if (thisWeek === undefined || thisWeek === null || thisWeek <= 0) {
            return sumWeek <= 0 ? 'invalid' : 'inactive';
        }

        return thisWeek >= (4 * 60 * 60) ? 'active' : 'semi';
    }

    function sum(hours) {
        let s = 0;

        for (let week = current; week > current - 5; week--) {
            const thisWeek = resolve(hours[week + '']);

            s += thisWeek ? thisWeek : 0;
        }

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

        if (hours === 0 && minutes === 0) {
            return seconds + ' seconds';
        }

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
        let difference = moment().utc().unix() - weekZero;

        return Math.floor(difference / 604800);
    }

    function getDateRange(week) {
        week = parseInt(week);

        const timestamp = (week * 604800) + weekZero;

        const isoWeek = moment.unix(timestamp).utc();

        if (week === currentWeek()) {
            return "This week";
        } else if (week === currentWeek() - 1) {
            return "Last week";
        }

        return isoWeek.format('DD.MM.YYYY') + " - " + isoWeek.add(6, 'days').format('DD.MM.YYYY');
    }

    function ensure(number) {
        if (number === undefined || number === null) {
            return -1;
        }
        return number;
    }

    function cmp(a, b) {
        const thisA = ensure(a.onDutyTime[current + '']),
            thisB = ensure(b.onDutyTime[current + '']);

        if (thisA === thisB) {
            const lastA = ensure(a.onDutyTime[(current - 1) + '']),
                lastB = ensure(b.onDutyTime[(current - 1) + '']);

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
