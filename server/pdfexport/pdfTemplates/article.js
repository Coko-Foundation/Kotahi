// NOTE: we should use this as njk, but to get this going now I'm just exporting this as a string.
//
// from here: https://gitlab.coko.foundation/kotahi/kotahi-default-pub/-/blob/main/src/layouts/print.njk
//
// NOTE: filterHtml was causing a crash (in line 62), so I took it out.
// NOTE: CSS and JS were taken out of the template.

module.exports = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{article.meta.title}}</title>
		<!--<link rel="preload" as="font" href="/profiles/Newsreader-Italic-VariableFont_opsz,wght.ttf" type="font/ttf" crossorigin="anonymous">
		<link rel="preload" as="font" href="/profiles/Newsreader-VariableFont_opsz,wght.ttf" type="font/ttf" crossorigin="anonymous">-->
		<!--<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,700;1,300;1,700&display=swap" rel="stylesheet">
		<link rel="stylesheet" href="/css/interface.css">
    <link rel="stylesheet" href="/css/print.css">
    <script src="/js/paged.polyfill.js"></script>
    <script src="/js/csstree.js"></script>
    <script src="/js/addID.js"></script>
    <script src="/js/imageRatio.js"></script> -->
  </head>
  <body>


    {% set emailList = [] %}

    <section class="titlepage"> 
      <!--<img class="logo" src="{{article.publicationMetadata.publisherLogo}}" alt="logo" >-->
      <header>
        <p id="researchLevel">
          {{article.parsedSubmission.objectType}}
        </p>
        <ul id="topicList">
          {% for topic in article.parsedSubmission.topic %} 
                                                                                                                                                                                                       <li>{{topic}}</li> 
          {% endfor %}
        </ul>
        <h1 class="tile">{{article.meta.title}}</h1>
        <p class= "authors">
          <ul class="authors-list">
            {% for author in article.parsedSubmission.authors %}
                                                                                                                                                                                                       <li>
              {% if author.email === parsedSubmission.AuthorCorrespondence%}
                                                                                                                                                                                                       <sup>*</sup>
              {% endif %}
              {{author.lastName | safe}} {{author.firstName | safe}} 
              <small>{{author.affiliation}}</small>
            </li>
            {% endfor %}
          </ul>
        </p>
      </header>
      <aside class="marginData left">
        <section class="emailList">
          {# if corresponding: true show email #}
          <h4> <sup>*</sup> For Correspondence:</h4>
          <p>{{parsedSubmission.AuthorCorrespondence}}</p>
        </section>
        <section>
          <h4> Competing Interest:</h4>
          <p>{{article.parsedSubmission.conflictOfInterest}}</p>
        </section>
        {% if article.parsedSubmission.Funding %}

                                                                                                                                                                                                       <section> 
          <h4>Funding:</h4> 
          <p>{{article.parsedSubmission.Funding }}</p> 
        </section>

        {% endif %}
        <section class="date">
          <div>
            <h4>Received:</h4> 
            <p>{{article.parsedSubmission.dateReceived}}</p>
          </div>
          <div>
            <h4> Accepted:</h4> 
            <p>{{article.parsedSubmission.DateAccepted}}</p>
          </div>
          <div>
            <h4> Published:</h4>
            <p>{{article.parsedSubmission.DatePublished}}</p>
          </div>
        </section>
        <section class="copyright">
          {# add logo here #}
          <!-- <p>Copyright Holder,</p> -->
          <!-- <p> Copyright description</p> -->
        </section>
      </aside>
    </section>

    <section class="content">
      {{article.parsedSubmission.abstract | safe}}
      {{article.meta.source | safe}}
    </section>


  </body>
</html>  
`
