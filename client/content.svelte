<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title></title>
        <base href=".">
		<style>
body {
    margin: 0;
    padding: 30px;
    background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    -webkit-font-smoothing: antialiased;
}
main {
    max-width: 920px;
}
header {
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
}
@media print{
    .content-wrapper {
        -webkit-print-color-adjust: exact;
        background: #FFFFFF !important;
    }
    h1.page, h2.page {
        page-break-before: always;
    }
    p,
    h3,
    .print:last-child {
        page-break-after: auto;
    }
}

.page {
    margin: 50px;
}

h1, h2, h3, h4, h5, h6 {
    color: #222;
    font-weight: 600;
    line-height: 1.3em;
}

h2 {
    margin-top: 1.3em;
}

h5 {
    text-align: center;
}
    
b, strong {
    font-weight: 600;
}
p {
    text-indent: 1em;
    margin-left: 20px;
}
    
ul, ol {
    margin-left: 20px;
    padding-inline-start: 20px;
}
ul ol,
ul ul,
ol ol,
ol ul
{
    margin-left: 0px;
    padding-inline-start: 20px;
}
    
ul.none {
    list-style-type:none;
}

li p {
    margin-left: 0;
    text-indent: 0;
    margin-block-start: 0;
    margin-block-end: 0;
}
li.level {
    list-style: none;
    display: inline
}

table,
td,
th
{
    border: 1px solid;
}
    
td, th {
    padding: 5px;
}
    
th {
    text-align: center;
}

pre {
    font-family: 'Consolas', 'Deja Vu Sans Mono',
                'Bitstream Vera Sans Mono', monospace;
    font-size: 0.95em;
    line-height: 120%;
    padding: 0.5em;
    border: 1px solid #ccc;
    background-color: #f8f8f8;
}
    
pre a {
    color: inherit;
    text-decoration: underline;
}
img,
table {
    page-break-inside: avoid;
}
    
hr.page {
    display: none;
}
    
b, strong {
    font-weight: 600;
}

img {
    display: block;
    margin: 1.3em auto;
    max-width: 95%;
}

.title {
    text-align: center;
}
.strike {
    text-decoration: line-through;
}

@media (min-width: 768px) {
	ul {
		flex-wrap: wrap;
	}
	ul li {
		width: 230px;
		padding-right: 20px;
	}
}
@media (min-width: 992px) {
	body {
        padding: 45px;
    }
	ul li {
		font-size: 13px;
		box-sizing: border-box;
		justify-content: flex-start;
	}
}
        </style>
		<link rel="stylesheet" href="/style.css">
	</head>
	<body>
		<main>
			<header>
				<h1> <i></i>
			    </h1>
            </header>
			{@html html}
        </main>
    </body>
</html>
<script>
import {onMount, beforeUpdate, afterUpdate, createEventDispatcher} from 'svelte';
export let procs;

let {html} = procs;

beforeUpdate(() => {
	console.log('index beforeUpdate', procs);
});

</script>