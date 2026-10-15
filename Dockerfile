# set base image (host OS)
# CHANGED: `python:3.8` (floating tag; silently moved from Debian buster to
# bookworm over the years) -> pinned to buster. MongoDB 4.4 packages depend
# on libssl1.1, which only buster ships — on bookworm apt fails with
# "unmet dependencies".
FROM python:3.8-buster

# CHANGED: Debian buster is archived — deb.debian.org no longer serves it.
# Point apt at archive.debian.org; only `buster main` is needed by this image.
RUN echo "deb http://archive.debian.org/debian buster main" > /etc/apt/sources.list

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# CHANGED (optimized): `apt-get update` + install share ONE layer, so the
# package index can never go stale relative to the installs; the index is
# dropped afterwards to keep the image small.
RUN apt-get -o Acquire::Check-Valid-Until=false update \
    && apt-get install -y --no-install-recommends curl nano wget nginx git \
    && rm -rf /var/lib/apt/lists/*

# Yarn apt repo (yarn is not in Debian's own repos)
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list


# Mongo
# NOTE: `/bin/systemctl` is faked with `/bin/echo` on purpose: mongodb-org's
# install script calls systemctl (containers have no systemd); the fake turns
# that call into a harmless no-op so apt install succeeds.
RUN ln -s /bin/echo /bin/systemctl
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - \
    && echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
RUN apt-get -o Acquire::Check-Valid-Until=false update \
    && apt-get install -y mongodb-org \
    && rm -rf /var/lib/apt/lists/*

# Install Yarn
# CHANGED (optimized): re-index + install in one layer, lists dropped after.
RUN apt-get -o Acquire::Check-Valid-Until=false update \
    && apt-get install -y yarn \
    && rm -rf /var/lib/apt/lists/*

# Install PIP
# CHANGED: `easy_install pip` no longer exists (removed from modern setuptools);
# the base image already ships pip, so it is only pinned/refreshed here.
# NOTE: pinned BELOW 24.1 — pip >= 24.1 enforces strict wheel metadata and
# rejects legacy packages in this requirements.txt (e.g. celery==5.0.5
# declares "pytz (>dev)", which is invalid). "pip<24.1" is pip's own
# suggested workaround for installing such old wheels.
RUN pip install --no-cache-dir --upgrade "pip<24.1"


ENV ENV_TYPE staging
ENV MONGO_HOST mongo
ENV MONGO_PORT 27017
##########

ENV PYTHONPATH=$PYTHONPATH:/src/

# copy the dependencies file to the working directory
# (kept BEFORE any source copy: the heavy pip layer stays cached when only
# application code changes)
COPY src/requirements.txt .

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt
