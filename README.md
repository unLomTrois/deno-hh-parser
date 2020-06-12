# deno-hh-parser
It's a deno-powered cli-tool to fetch and analyze vacancies (and resumes soon...) from [HeadHunter](https://hh.ru/), one of the largest job and employee search sites in the world. 

## install
```git clone https://github.com/unLomTrois/deno-hh-parser.git```

```install```

```deno-hh-parser --query=*job_name*```

## features
### avoid
One of the features of parser is **avoiding**-option, that will exclude avoid-words from response 

Example:
```deno-hh-parser --query=programmer --avoid=PHP --avoid=Python```
will find vacancies that not includes "PHP" and "Python"

## limitations
HeadHunter API has limitation on per_page and page parameters.

When indicating paging parameters (page, per_page), a restriction takes effect: the number of results returned can't exceed 2000

So, deno-hh-parser also has limit-option:

```deno-hh-parser --query=secretary --limit=200```

by-default --limit is 100

