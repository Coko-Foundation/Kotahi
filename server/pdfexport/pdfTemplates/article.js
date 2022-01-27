// NOTE: we should use this as njk, but to get this going now I'm just exporting this as a string.
// NOTE: filterHtml was causing a crash, so I took it out.

module.exports = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{article.meta.title}}</title>
</head>
<body>

{% set affiliationList = [] %}
{% set emailList = [] %}
{% set leftMarginList = [{

}]%}
{% for author in article.submission.authors  %}
  {% for affiliation in author.affiliation %}
    {% if affiliation  in affiliationList  %}
    {% else %}
        {% set  affiliationList = (affiliationList.push(affiliation), affiliationList)%}
    {% endif %}
  {% endfor %} 
{% endfor %}

<section class="titlepage"> 
  <h1 class="tile">{{article.meta.title}}</h1>
  <p class= "authors">
    {% for author in article.submission.authors %}
      {{author.lastName | safe}} {{author.firstName | safe}} 
      {% for affiliation in affiliationList %}
        {% if affiliation in author.affiliation %}          
          <sup>{{loop.index}}</sup>             
        {% endif %}
      {% endfor %}
      {% if author.email %}
        <sup>*</sup>
        {% if author.email in emailList  %}
        {% else %}
            {% set  emailList = (emailList.push(author.email), emailList)%}
        {% endif %}
      {% endif %}
    {% endfor %}
  </p>

  <p class= "affiliations">
    {% for affiliation in affiliationList %}
      <sup>{{loop.index}}</sup>{{ affiliation }}
    {% endfor %}
  </p>
  {# hide this using CSS #}

  <div class="to-hide">
    <span id="researchLevel">
      {{article.submission.objectType}}
    </span>
    <div class="leftMarginList">
      <p class="emailList"><strong> <sup>*</sup> For Correspondence:</strong></p>
      <ul class="emailList">
        {% for email in emailList %}
          <li>{{email}}</li>
        {% endfor %}
      </ul>
      <p class="symbol"><strong><sup>†</sup></strong>These authors contributed equally to this work</p>
      <p class="symbol"><strong><sup>‡</sup></strong>These authors also contributed equally to this work</p>
      <p class="COI"><strong> Competing Interest:</strong> {{article.submission.conflictOfInterest}}</p>
      <p class="funding"><strong> funding:</strong> {{article.submission.Funding}}</p>
      <p class="date"><strong> Received:</strong> {{article.submission.dateReceived}}</p>
      <p class="date"><strong> Accepted:</strong> {{article.submission.DateAccepted}}</p>
      <p class="date"><strong> Published:</strong> {{article.submission.DatePublished}}</p>
      <p><strong>Reviewing Editor:</strong> {{article.submission.reviewingEditor}}</p>
      <div class="copyright">
        <h4 id="copyrightName">{{article.publicationMetadata.copyright.name}}</h4>
        <p id="copyright-description">{{article.publicationMetadata.copyright.description}}</p>
        <span id="CopyrightYear">{{article.publicationMetadata.copyright.year}}</span>
      </div>
      <span id="publisher">{{article.publicationMetadata.publisher}}</span>
      <span id="articleId">{{article.publicationMetadata.articleIdOnWebsite}}</span>
      <span id="articleWebLink">article-website-link</span>
      <ul id="tagList">
        {% for tag in tagList %}
          <li>{{tag}}</li>
        {% endfor %}
      </ul>
    </div>
  </div>


</section>

<section class="content">
{{article.meta.source | safe}}
</section>

</body>
</html>`
