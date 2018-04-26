
CREATE TABLE "plays" (
    "id" serial PRIMARY key NOT NULL,
    "name" varchar(100) NOT NULL UNIQUE
);

CREATE TABLE "speakers" (
    "id" serial PRIMARY key NOT NULL,
    "name" varchar(100) NOT NULL,
    "play_id" INT REFERENCES "plays" NOT NULL
);

CREATE TABLE "lines" (
    "id" serial PRIMARY key NOT NULL,
    "index" varchar(100) NOT NULL,
    "text" varchar(500) NOT NULL,
    "speaker_id" INT REFERENCES "speakers" NOT NULL
);  
