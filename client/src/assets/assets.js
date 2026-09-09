import logo from './logo.svg'
import marvelLogo from './marvelLogo.svg'
import googlePlay from './googlePlay.svg'
import appStore from './appStore.svg'
import screenImage from './screenImage.svg'
import profile from './profile.png'

export const assets = {
    logo,
    marvelLogo,
    googlePlay,
    appStore,
    screenImage,
    profile
}

export const dummyTrailers = [
    {
        image: "https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=WpW36ldAqnM'
    },
    {
        image: "https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=-sAOWhvheK8'
    },
    {
        image: "https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=1pHDWnXmK7Y'
    },
    {
        image: "https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg",
        videoUrl: 'https://www.youtube.com/watch?v=umiKiW4En9g'
    },
]

const dummyCastsData = [
    { "name": "Milla Jovovich", "profile_path": "https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg" },
    { "name": "Dave Bautista", "profile_path": "https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg" },
    { "name": "Arly Jover", "profile_path": "https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg" },
    { "name": "Amara Okereke", "profile_path": "https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg" },
    { "name": "Fraser James", "profile_path": "https://image.tmdb.org/t/p/original/mGAPQG2OKTgdKFkp9YpvCSqcbgY.jpg" },
    { "name": "Deirdre Mullins", "profile_path": "https://image.tmdb.org/t/p/original/lJm89neuiVlYISEqNpGZA5kTAnP.jpg" },
    { "name": "Sebastian Stankiewicz", "profile_path": "https://image.tmdb.org/t/p/original/hLN0Ca09KwQOFLZLPIEzgTIbqqg.jpg" },
    { "name": "Tue Lunding", "profile_path": "https://image.tmdb.org/t/p/original/qY4W0zfGBYzlCyCC0QDJS1Muoa0.jpg" },
    { "name": "Jacek Dzisiewicz", "profile_path": "https://image.tmdb.org/t/p/original/6Ksb8ANhhoWWGnlM6O1qrySd7e1.jpg" },
    { "name": "Ian Hanmore", "profile_path": "https://image.tmdb.org/t/p/original/yhI4MK5atavKBD9wiJtaO1say1p.jpg" },
    { "name": "Eveline Hall", "profile_path": "https://image.tmdb.org/t/p/original/uPq4xUPiJIMW5rXF9AT0GrRqgJY.jpg" },
    { "name": "Kamila Klamut", "profile_path": "https://image.tmdb.org/t/p/original/usWnHCzbADijULREZYSJ0qfM00y.jpg" },
    { "name": "Caoilinn Springall", "profile_path": "https://image.tmdb.org/t/p/original/uZNtbPHowlBYo74U1qlTaRlrdiY.jpg" },
    { "name": "Jan Kowalewski", "profile_path": "https://image.tmdb.org/t/p/original/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg" },
    { "name": "Pawel Wysocki", "profile_path": "https://image.tmdb.org/t/p/original/zmznPrQ9GSZwcOIUT0c3GyETwrP.jpg" },
    { "name": "Simon Lööf", "profile_path": "https://image.tmdb.org/t/p/original/cbZrB8crWlLEDjVUoak8Liak6s.jpg" },
    { "name": "Tomasz Cymerman", "profile_path": "https://image.tmdb.org/t/p/original/nTSPtzWu6deZTJtWXHUpACVznY4.jpg" }
]

export const dummyShowsData = [
    {
        "_id": "324544",
        "id": 324544,
        "title": "In the Lost Lands",
        "overview": "A queen sends the powerful and feared sorceress Gray Alys to the ghostly wilderness of the Lost Lands in search of a magical power, where she and her guide, the drifter Boyce, must outwit and outfight both man and demon.",
        "poster_path": "https://image.tmdb.org/t/p/original/dDlfjR7gllmr8HTeN6rfrYhTdwX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/op3qmNhvwEvyT7UFyPbIfQmKriB.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 14, "name": "Fantasy" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-02-27",
        "original_language": "en",
        "tagline": "She seeks the power to free her people.",
        "vote_average": 6.4,
        "vote_count": 15000,
        "runtime": 102
    },
    {
        "_id": "1232546",
        "id": 1232546,
        "title": "Until Dawn",
        "overview": "One year after her sister Melanie mysteriously disappeared, Clover and her friends head into the remote valley where she vanished in search of answers.",
        "poster_path": "https://image.tmdb.org/t/p/original/juA4IWO52Fecx8lhAsxmDgy3M3.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/icFWIk1KfkWLZnugZAJEDauNZ94.jpg",
        "genres": [
            { "id": 27, "name": "Horror" },
            { "id": 9648, "name": "Mystery" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-23",
        "original_language": "en",
        "tagline": "Every night a different nightmare.",
        "vote_average": 6.405,
        "vote_count": 18000,
        "runtime": 103
    },
    {
        "_id": "552524",
        "id": 552524,
        "title": "Lilo & Stitch",
        "overview": "The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.",
        "poster_path": "https://image.tmdb.org/t/p/original/mKKqV23MQ0uakJS8OCE2TfV5jNS.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/7Zx3wDG5bBtcfk8lcnCWDOLM4Y4.jpg",
        "genres": [
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" },
            { "id": 878, "name": "Science Fiction" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-05-17",
        "original_language": "en",
        "tagline": "Hold on to your coconuts.",
        "vote_average": 7.117,
        "vote_count": 27500,
        "runtime": 108
    },
    {
        "_id": "668489",
        "id": 668489,
        "title": "Havoc",
        "overview": "When a drug heist swerves lethally out of control, a jaded cop fights his way through a corrupt city's criminal underworld to save a politician's son.",
        "poster_path": "https://image.tmdb.org/t/p/original/ubP2OsF3GlfqYPvXyLw9d78djGX.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/65MVgDa6YjSdqzh7YOA04mYkioo.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 80, "name": "Crime" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-25",
        "original_language": "en",
        "tagline": "No law. Only disorder.",
        "vote_average": 6.537,
        "vote_count": 35960,
        "runtime": 107
    },
    {
        "_id": "950387",
        "id": 950387,
        "title": "A Minecraft Movie",
        "overview": "Four misfits find themselves struggling with ordinary problems when they are suddenly pulled through a mysterious portal into the Overworld.",
        "poster_path": "https://image.tmdb.org/t/p/original/yFHHfHcUgGAxziP1C3lLt0q2T4s.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg",
        "genres": [
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" },
            { "id": 12, "name": "Adventure" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-03-31",
        "original_language": "en",
        "tagline": "Be there and be square.",
        "vote_average": 6.516,
        "vote_count": 15225,
        "runtime": 101
    },
    {
        "_id": "575265",
        "id": 575265,
        "title": "Mission: Impossible - The Final Reckoning",
        "overview": "Ethan Hunt and team continue their search for the terrifying AI known as the Entity.",
        "poster_path": "https://image.tmdb.org/t/p/original/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/1p5aI299YBnqrEEvVGJERk2MXXb.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-05-17",
        "original_language": "en",
        "tagline": "Our lives are the sum of our choices.",
        "vote_average": 7.042,
        "vote_count": 19885,
        "runtime": 170
    },
    {
        "_id": "986056",
        "id": 986056,
        "title": "Thunderbolts*",
        "overview": "After finding themselves ensnared in a death trap, seven disillusioned castoffs must embark on a dangerous mission.",
        "poster_path": "https://image.tmdb.org/t/p/original/m9EtP1Yrzv6v7dMaC9mRaGhd1um.jpg",
        "backdrop_path": "https://image.tmdb.org/t/p/original/rthMuZfFv4fqEU4JVbgSW9wQ8rs.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2025-04-30",
        "original_language": "en",
        "tagline": "Everyone deserves a second shot.",
        "vote_average": 7.443,
        "vote_count": 23569,
        "runtime": 127
    },
    {
        "_id": "1022789",
        "id": 1022789,
        "title": "Inside Out 2",
        "overview": "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions!",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJlvfA3g9NiVxSM5LUAxSeOFNzhGp0zjNVunBWwG-41g&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/xg27Iio1522P2m23.jpg",
        "genres": [
            { "id": 16, "name": "Animation" },
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-06-12",
        "original_language": "en",
        "tagline": "Make room for new emotions.",
        "vote_average": 7.6,
        "vote_count": 4800,
        "runtime": 96
    },
    {
        "_id": "533535",
        "id": 533535,
        "title": "Deadpool & Wolverine",
        "overview": "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx6z7XSeCJ2l_j2yqLPRI-lFroHotHHebO2ECLaCaeew&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/yD4122.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 35, "name": "Comedy" },
            { "id": 878, "name": "Science Fiction" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-07-24",
        "original_language": "en",
        "tagline": "Everyone deserves a happy ending.",
        "vote_average": 7.7,
        "vote_count": 5200,
        "runtime": 128
    },
    {
        "_id": "519182",
        "id": 519182,
        "title": "Despicable Me 4",
        "overview": "Gru and Lucy and their girls welcome a new member to the Gru family, Gru Jr., who is intent on tormenting his dad.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScjnWl9-a6LO454CY3A4JivV95u2gsV9CsBObKSUwb5w&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/lg0234.jpg",
        "genres": [
            { "id": 16, "name": "Animation" },
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-06-20",
        "original_language": "en",
        "tagline": "Things just got a little more despicable.",
        "vote_average": 7.1,
        "vote_count": 2100,
        "runtime": 94
    },
    {
        "_id": "693134",
        "id": 693134,
        "title": "Dune: Part Two",
        "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn35r4NtzZbFMYAYE4hjmZaPV34wjT_49V8FM6oJaRMQ&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9R22f3.jpg",
        "genres": [
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-02-27",
        "original_language": "en",
        "tagline": "Long live the fighters.",
        "vote_average": 8.2,
        "vote_count": 5100,
        "runtime": 166
    },
    {
        "_id": "823464",
        "id": 823464,
        "title": "Godzilla x Kong: The New Empire",
        "overview": "Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTJbXhZcIU3mJi1K8ZG7L3Um0h4kwTRrJBIjnrnmC1rA&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/b0019283.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-03-27",
        "original_language": "en",
        "tagline": "Rise together or fall alone.",
        "vote_average": 7.2,
        "vote_count": 3800,
        "runtime": 115
    },
    {
        "_id": "653346",
        "id": 653346,
        "title": "Kingdom of the Planet of the Apes",
        "overview": "Many years after the reign of Caesar, a young ape undertakes a journey that will lead him to question everything.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStMCHyVlrgBGxJeRRYYQyU8nZ3ETt3cywDY-dH0ZS2Rg&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/p092384.jpg",
        "genres": [
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" },
            { "id": 28, "name": "Action" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-05-08",
        "original_language": "en",
        "tagline": "No one can stop the reign.",
        "vote_average": 7.1,
        "vote_count": 2900,
        "runtime": 145
    },
    {
        "_id": "786892",
        "id": 786892,
        "title": "Furiosa: A Mad Max Saga",
        "overview": "As the world fell, young Furiosa is snatched from the Green Place of Many Mothers into the hands of a great Biker Horde.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcgLyTIuzTLxJf10ddVRZC8M3Bo1y9UgR5vbwo4cjU5w&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/w92384.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 878, "name": "Science Fiction" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-05-22",
        "original_language": "en",
        "tagline": "Out of darkness, a warrior rises.",
        "vote_average": 7.6,
        "vote_count": 3100,
        "runtime": 148
    },
    {
        "_id": "573435",
        "id": 573435,
        "title": "Bad Boys: Ride or Die",
        "overview": "After their late former Captain is framed, Mike Lowrey and Marcus Burnett go on the run to clear his name.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrv5pEqhXsyf_6cHGAAHOiZH6wb10uyn_Xp9V1vnwWDQ&s",
        "backdrop_path": "https://image.tmdb.org/t/p/original/v98234.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 35, "name": "Comedy" },
            { "id": 80, "name": "Crime" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-06-05",
        "original_language": "en",
        "tagline": "Ride together, die together.",
        "vote_average": 7.0,
        "vote_count": 2200,
        "runtime": 115
    },
    {
        "_id": "748783",
        "id": 748783,
        "title": "The Garfield Movie",
        "overview": "Garfield, the world-famous indoor-loving cat, is about to have a wild outdoor adventure.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY4Ag1GtW4KICeVCpLt7PyUFY-pQmyZZ-8yPAof-koPQ&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/k902384.jpg",
        "genres": [
            { "id": 16, "name": "Animation" },
            { "id": 10751, "name": "Family" },
            { "id": 35, "name": "Comedy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-04-30",
        "original_language": "en",
        "tagline": "Outdoor cat mode activated.",
        "vote_average": 6.7,
        "vote_count": 1400,
        "runtime": 101
    },
    {
        "_id": "1011985",
        "id": 1011985,
        "title": "Kung Fu Panda 4",
        "overview": "Po is gearing up to become the spiritual leader of his Valley of Peace, but needs someone to take his place as Dragon Warrior.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVh2GRl-dXTaGGJLpado5E58NBTLqJxCXFq030h6rEPg&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/p912384.jpg",
        "genres": [
            { "id": 16, "name": "Animation" },
            { "id": 28, "name": "Action" },
            { "id": 10751, "name": "Family" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-03-02",
        "original_language": "en",
        "tagline": "Hold on to your dumplings.",
        "vote_average": 7.1,
        "vote_count": 2600,
        "runtime": 94
    },
    {
        "_id": "359410",
        "id": 359410,
        "title": "Gladiator II",
        "overview": "Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSJ_fqYtgUPn_k2OrAgFiYWHs5cF7iAzwX0ET68nON1w&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/h92834.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 12, "name": "Adventure" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-11-13",
        "original_language": "en",
        "tagline": "Prepare to be entertained.",
        "vote_average": 6.8,
        "vote_count": 1900,
        "runtime": 148
    },
    {
        "_id": "912649",
        "id": 912649,
        "title": "Venom: The Last Dance",
        "overview": "Eddie and Venom are on the run. Hunted by both of their worlds, the duo are forced into a devastating decision.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7RF2qBKFfgKYqOY8VznlabN4epuPZz3D4xKDHhmOWZg&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/m0192384.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 12, "name": "Adventure" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-10-22",
        "original_language": "en",
        "tagline": "'Til death do they part.",
        "vote_average": 6.5,
        "vote_count": 2100,
        "runtime": 109
    },
    {
        "_id": "402431",
        "id": 402431,
        "title": "Wicked",
        "overview": "Elphaba, a misunderstood young woman with green skin, and Glinda, a popular young woman gilded by privilege, meet at Shiz University.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsh5jDI7QgKlHLjpXKgtkQD_DqCHS2KiRAPkBjRcroag&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/e0192384.jpg",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 14, "name": "Fantasy" },
            { "id": 10402, "name": "Music" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-11-20",
        "original_language": "en",
        "tagline": "Everyone deserves the chance to fly.",
        "vote_average": 7.4,
        "vote_count": 1500,
        "runtime": 160
    },
    {
        "_id": "845781",
        "id": 845781,
        "title": "Red One",
        "overview": "After a villain kidnaps Santa Claus, an E.L.F. operative must team up with the world's most accomplished tracker to save Christmas.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRCWHEIoEy44hSVfbpyI6tFehjREnyxHTAT5eHXKKEHw&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/f0192384.jpg",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 35, "name": "Comedy" },
            { "id": 14, "name": "Fantasy" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-10-31",
        "original_language": "en",
        "tagline": "Christmas is saved... hopefully.",
        "vote_average": 6.9,
        "vote_count": 1200,
        "runtime": 123
    },
    {
        "_id": "1184918",
        "id": 1184918,
        "title": "The Wild Robot",
        "overview": "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island and bonds with the island's animals.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSLF5vWRgK4zOtpbk655Wtl0WovJEHPbv8MCYBjBz95Q&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/g0192384.jpg",
        "genres": [
            { "id": 16, "name": "Animation" },
            { "id": 878, "name": "Science Fiction" },
            { "id": 10751, "name": "Family" }
        ],
        "casts": dummyCastsData,
        "release_date": "2024-09-12",
        "original_language": "en",
        "tagline": "Sometimes, to survive, we must become more than we were programmed to be.",
        "vote_average": 8.4,
        "vote_count": 2800,
        "runtime": 102
    }
]




// =====================================================
// DUMMY THEATERS (Kathmandu Valley) – ✅ Now at top level
// =====================================================

export const dummyTheaters = [
    {
        _id: "theater1",
        name: "QFX Civil Mall",
        address: "Civil Trade Centre, Sundhara",
        city: "Kathmandu",
        latitude: 27.7000,
        longitude: 85.3167,
    },
    {
        _id: "theater2",
        name: "QFX Chhaya Center",
        address: "Chhaya Center, Thamel",
        city: "Kathmandu",
        latitude: 27.7133,
        longitude: 85.3153,
    },
    {
        _id: "theater3",
        name: "QFX Durbar Cinemax",
        address: "Durbar Mall, Durbarmarg",
        city: "Kathmandu",
        latitude: 27.7064,
        longitude: 85.3185,
    },
    {
        _id: "theater4",
        name: "QFX Labim Mall",
        address: "Labim Mall, Pulchowk",
        city: "Lalitpur",
        latitude: 27.6733,
        longitude: 85.3215,
    },
    {
        _id: "theater5",
        name: "QFX Rising Mall",
        address: "Rising Mall, Kathmandu",
        city: "Kathmandu",
        latitude: 27.6967,
        longitude: 85.3142,
    },
    {
        _id: "theater6",
        name: "QFX Thimi",
        address: "Bhaktapur",
        city: "Bhaktapur",
        latitude: 27.6728,
        longitude: 85.4299,
    },
    {
        _id: "theater7",
        name: "Ranjana Cineplex",
        address: "New Road, Kathmandu",
        city: "Kathmandu",
        latitude: 27.7042,
        longitude: 85.3101,
    },
    {
        _id: "theater8",
        name: "Bishwojyoti Cineplex",
        address: "Kathmandu",
        city: "Kathmandu",
        latitude: 27.7024,
        longitude: 85.3161,
    },
    {
        _id: "theater9",
        name: "Cine de Chef",
        address: "Civil Trade Centre, Sundhara",
        city: "Kathmandu",
        latitude: 27.7000,
        longitude: 85.3167,
    },
    {
        _id: "theater10",
        name: "Guna Cinema",
        address: "Gwarko, Lalitpur",
        city: "Lalitpur",
        latitude: 27.6578,
        longitude: 85.3233,
    },
    {
        _id: "theater11",
        name: "FCube Cinemas",
        address: "KL Tower, Chabahil",
        city: "Kathmandu",
        latitude: 27.7233,
        longitude: 85.3389,
    },
    {
        _id: "theater12",
        name: "One Cinemas",
        address: "Eyeplex Mall, New Baneshwor",
        city: "Kathmandu",
        latitude: 27.6914,
        longitude: 85.3350,
    },
    {
        _id: "theater13",
        name: "Jai Nepal Cinemas",
        address: "Narayanhiti Marg, Kathmandu",
        city: "Kathmandu",
        latitude: 27.7100,
        longitude: 85.3133,
    },
    {
        _id: "theater14",
        name: "Asta Narayan Pictures",
        address: "Balaju, Kathmandu",
        city: "Kathmandu",
        latitude: 27.7167,
        longitude: 85.3089,
    },
    {
        _id: "theater15",
        name: "BSR Movies",
        address: "Gongabu, Kathmandu",
        city: "Kathmandu",
        latitude: 27.7211,
        longitude: 85.3167,
    },
    {
        _id: "theater16",
        name: "Infinity Movies",
        address: "Gongabu, Kathmandu",
        city: "Kathmandu",
        latitude: 27.7211,
        longitude: 85.3167,
    },
    {
        _id: "theater17",
        name: "INI Lotse Cinemas",
        address: "Naya Buspark, Kathmandu",
        city: "Kathmandu",
        latitude: 27.7100,
        longitude: 85.3300,
    },
    {
        _id: "theater18",
        name: "INI Screenplay Cinemas",
        address: "Baneshwor, Kathmandu",
        city: "Kathmandu",
        latitude: 27.6894,
        longitude: 85.3333,
    },
    {
        _id: "theater19",
        name: "Kirtipur Cineplex",
        address: "Kirtipur, Kathmandu",
        city: "Kathmandu",
        latitude: 27.6744,
        longitude: 85.2786,
    },
    {
        _id: "theater20",
        name: "Metro Plaza Cinema Complex",
        address: "Kuleshwor, Kathmandu",
        city: "Kathmandu",
        latitude: 27.6944,
        longitude: 85.2800,
    },
    {
        _id: "theater21",
        name: "MidTown Cinemas",
        address: "Kathmandu",
        city: "Kathmandu",
        latitude: 27.7000,
        longitude: 85.3167,
    },
    {
        _id: "theater22",
        name: "Mandala Theatre",
        address: "Kathmandu",
        city: "Kathmandu",
        latitude: 27.7000,
        longitude: 85.3167,
    },
    {
        _id: "theater23",
        name: "City Square Mall (QFX)",
        address: "Samakhusi, Kathmandu",
        city: "Kathmandu",
        latitude: 27.7292,
        longitude: 85.3181,
    },
];