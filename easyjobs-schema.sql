--
-- PostgreSQL database dump
--

\restrict RloE5OluCuLXxDthG6LU1hhLyC944MlbtFXdrvvBaBon4okolqaNmPT1JalM5Uq

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: applicationstatus; Type: TYPE; Schema: public; Owner: khushimandaliya
--

CREATE TYPE public.applicationstatus AS ENUM (
    'PENDING',
    'UNDER_REVIEW',
    'ACCEPTED',
    'REJECTED'
);


ALTER TYPE public.applicationstatus OWNER TO khushimandaliya;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: khushimandaliya
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO khushimandaliya;

--
-- Name: interviews; Type: TABLE; Schema: public; Owner: khushimandaliya
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    application_id integer NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    duration_minutes integer NOT NULL,
    location character varying,
    meeting_link character varying,
    interview_type character varying NOT NULL,
    notes text,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.interviews OWNER TO khushimandaliya;

--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: khushimandaliya
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.interviews_id_seq OWNER TO khushimandaliya;

--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: khushimandaliya
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: job_applications; Type: TABLE; Schema: public; Owner: khushimandaliya
--

CREATE TABLE public.job_applications (
    id integer NOT NULL,
    job_id integer NOT NULL,
    applicant_id integer NOT NULL,
    cover_letter text,
    resume_url character varying NOT NULL,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    offer_details text,
    offer_salary double precision,
    offer_expiry_date timestamp without time zone
);


ALTER TABLE public.job_applications OWNER TO khushimandaliya;

--
-- Name: job_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: khushimandaliya
--

CREATE SEQUENCE public.job_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.job_applications_id_seq OWNER TO khushimandaliya;

--
-- Name: job_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: khushimandaliya
--

ALTER SEQUENCE public.job_applications_id_seq OWNED BY public.job_applications.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: khushimandaliya
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying NOT NULL,
    company_name character varying NOT NULL,
    location character varying NOT NULL,
    description text NOT NULL,
    requirements text NOT NULL,
    salary_min double precision,
    salary_max double precision,
    employment_type character varying NOT NULL,
    status character varying,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    posted_by_id integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO khushimandaliya;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: khushimandaliya
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_id_seq OWNER TO khushimandaliya;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: khushimandaliya
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: khushimandaliya
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    username character varying NOT NULL,
    hashed_password character varying NOT NULL,
    role character varying,
    is_superuser boolean,
    is_active boolean,
    email_verified boolean,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    reset_token character varying,
    is_supervisor boolean
);


ALTER TABLE public.users OWNER TO khushimandaliya;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: khushimandaliya
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO khushimandaliya;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: khushimandaliya
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: job_applications id; Type: DEFAULT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.job_applications ALTER COLUMN id SET DEFAULT nextval('public.job_applications_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_reset_token_key; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_reset_token_key UNIQUE (reset_token);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: ix_interviews_id; Type: INDEX; Schema: public; Owner: khushimandaliya
--

CREATE INDEX ix_interviews_id ON public.interviews USING btree (id);


--
-- Name: ix_job_applications_id; Type: INDEX; Schema: public; Owner: khushimandaliya
--

CREATE INDEX ix_job_applications_id ON public.job_applications USING btree (id);


--
-- Name: ix_jobs_id; Type: INDEX; Schema: public; Owner: khushimandaliya
--

CREATE INDEX ix_jobs_id ON public.jobs USING btree (id);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: khushimandaliya
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: interviews interviews_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.job_applications(id);


--
-- Name: job_applications job_applications_applicant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.users(id);


--
-- Name: job_applications job_applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- Name: jobs jobs_posted_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: khushimandaliya
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_posted_by_id_fkey FOREIGN KEY (posted_by_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict RloE5OluCuLXxDthG6LU1hhLyC944MlbtFXdrvvBaBon4okolqaNmPT1JalM5Uq

