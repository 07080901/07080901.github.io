FROM ruby:3.2
WORKDIR /srv/jekyll
COPY Gemfile ./
RUN bundle install
EXPOSE 4000 35729
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload", "--force_polling"]
