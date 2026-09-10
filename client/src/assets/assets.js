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
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBZHk2vwaMe_bzxqLTC5SshUEOzfoMt_SbAeXHNJ8iBO8rFGf_DP5vIfA_xXP7BBQYeffiznegDLV7gN6F5A80Q9wzFuS2z6SK5cbZdhmu&s=10",
        videoUrl: 'https://youtu.be/5zbtEmxEyGk'
    },
    {
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf1F0Wtgg4tQ7aE9C_zHN0Pb-Jk4jlHgGnxrYip39eWg&s",
        videoUrl: 'https://www.youtube.com/watch?v=_hBsVHlNOtA'
    },
    {
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2tdvTg8AfyNDKxUL_0Qi9QccGDjIczYEwPtlJpi3GMA&s=10",
        videoUrl: 'https://www.youtube.com/watch?v=Tc0ZtDdNkX8'
    },
    {
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqB2Hqy47xNmTFpfU7JmRK_gWKXJuoOjZXOyzyI_p1Uw&s=10",
        videoUrl: 'https://www.youtube.com/watch?v=QcbIDqe9Nkk'
    },
]

// =====================================================
// CAST PHOTO LOOKUP
// Real photo URLs for actors we have images for.
// Anyone not in this list gets an avatar placeholder.
// Add more here later as you find photos.
// =====================================================
const castPhotoLookup = {
    // "name (lowercase)": "photo URL"
    "rajesh hamal": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeeMvBm0wjqDU2eyWkcT98dVk8HU4HgUJvJxPUbEtHew&s=10",
    "bhuwan k.c.": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBV0U8oSMSW1wT7nw2ceNm2ojcG8jaRLLdyFh8x_s2_Q&s=10",
    "nikhil upreti": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtlBfqk5aQxbCnbHtS6AiKnmjzPT9ZqGcS7OqunVLwAQ&s=10",
    "biraj bhatta": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2WmaTfVxByKDmnaYs0vrq6VlRZsvnfuVONmbzIwKuzQ&s=10",
    "dayahang rai": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEQ9FhTiASpICqw421csKY10w60TBSfqv4-7uipJ6cbA&s=10",
    "saugat malla": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-W7K8OntL4EyKCdgl0wUY6DDStbKM_qDPVa6YaNtw8Q&s=10",
    "nischal basnet": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6kKAn71jVKOSLmR3wcfzIEyOxVx5B1UmegcHWCeQSqw&s=10",
    "aryan sigdel": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmZy64mImYi2iMelv7x7PKTi-RS4u78OCSRtNP52HHQg&s=10",
    "aaryan sigdel": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmZy64mImYi2iMelv7x7PKTi-RS4u78OCSRtNP52HHQg&s=10",
    "deepak raj giri": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM2yrf0FH0xPHa2n-_rjle7yuEa9g-x1g_k8Pz9ur1Ug&s=10",
    "sitaram kattel": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXdQV3XZg_HfodenLuCm4wIx8QULgQsbjGxiWhLKe6Qw&s=10",
    "kedar ghimire": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvs7YUk5XxSwwoiursTfB48kL0GsTnQ3ToaJNZN_in0w&s=10",
    "karishma manandhar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4H2nlr8vOwHQ6TApbKEMTv0lhd0MfNSKSQjvXiqdbiQ&s=10",
    "richa sharma": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqahr7zUDTNfi-pAdNvpz12cHZARyJhUO6DwrsG7c_jg&s=10",
    "reecha sharma": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqahr7zUDTNfi-pAdNvpz12cHZARyJhUO6DwrsG7c_jg&s=10",
    "priyanka karki": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV0uypJK61MIeiOlik6FXlr-H5hPkFUG8pZwMXRUtZfg&s=10",
    "namrata shrestha": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbFWe-zuDm0w-nmL6vp46WifrOINkW-TqHO-e5Rry99Q&s=10",
    "rekha thapa": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTlNQ1h00UhfBx3-MqPYGP_7lDX7OYZxAKPUu3A16yDw&s=10",
    "keki adhikari": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMxY5hfzG_X2WGPBxrmQFRhZaXNIr8qQ8yJWwkaqXnrQ&s=10",
    "Anjana Baraili": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjdQNpjms6-ZxtvYQQM1CxAmeKgvH79qXzQeiPSg8hqw&s=10",
    "Sangeeta Thapa Magar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyAJNqLshjEXDql8p3iQ3BkNUP2V8TxfPOZkdluF5e6w&s=10",
    "Raj Thapa Kauchha": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtC2kCPRNhtRlIyA0sNNJLezegHNGfbMn5PyYHruNRHQ&s=10",
    "Sara Rai": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOSj1QJQO_rNnK2IzwLrXQkZUgb0SDaP_G9aOwzt2FGTL4V_vJ4inhCpg_&s=10",
    "Prakash Saput": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhY1SVB-C35A8b3V75O2gYFn6RJ2Qgh-XE4WN_-RNB9g&s=10",
    "Sujata Rai": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRr3WET52dUMcObiCRcF084zHH-RpOiSHi1-VgMyPvTow&s=10",
    "Sushma Niraula": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM9cKZ0pzwrZSJlSR5637rk9Xz4tE3B2gVLb5va-9kzMypi6_TRPMDqYA&s=10",
    "Buddhi Tamang": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOCN4dAHO79J6qwbKczwBokNU1gUAB2i2ojq5gcOMeIg&s=10",
    "Maotse Gurung": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyK1r52iRRqtu2ucwC0j_Ey_pzbusySmmctenh0y8cOQ&s=10",
    "Desh Bhakta Khanal": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLiJkpzut5KRqDzj22CGSSd8RwuZKEbl6f6UNCLbU5kg&s=10",
    "Bhola Raj Sapkota": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRfKDDxgQoTBJvi4wmU3ff1hOeJrS_R9alk_OVWeCMAw&s=10",
    "Binod Neupane": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGnee_yozY5fth19Alkfo86o1kc5Be7bJL7twDKh0Mwg&s=10",
    "Alisha Bastola": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNv-BCFc1RDOafaDpqasBPQiXSQLKTTIrt6147_BXyCw&s=10",
    "Swayam KC": "https://www.lensnepal.com/files/profiles/barsha-basnet.jpg",
    "Jaanbi Poudel": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQn_gLm_bvlaeI2hPpVcsxzI1ukNyq64x16ZAIAacvmQ&s=10",
    "Dhiraj Magar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgfcmBH6as4azJuGixKqsQfu0X9D8S6NLV0yjVKwIYZw&s=10",
    "Upasana Singh Thakuri": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQalxcdnVMzQQrb03XzR8FCFXL5yK0dDHYQHfRN2ANZMw&s=10",
    "Khadka Bahadur Pun": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQkHIlik8dod_au4rj_xEAJ4Z4a_gcOa0h1c5uDVylig&s=10",
    "Raju Resmi Magar": "https://tfnnew.in-maa-1.linodeobjects.com/uploads/medias/santosh-lama.jpg",
    "Raj Thapa Kauchha": "https://www.thefilmnepal.com/uploads/medias/thumbnail-md/saugat-malla.webp",
    "Astitwa Bhattachan": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRern_f8J9aUDp80PTuOAh3nK0lDfhLZ9LI03ndO1VJxTLQzNUyBABq0gb3&s=10",
    "Arun Pun Magar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpEGB3MzXxPyXFGzSUcMqaUM4dK4gNxofMoCHTyXd9eQ&s=10",
    "Kedar Ghimire": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHEIIV1_E07RIbS2eadAuOtDHesRAU4CiX8QRuzpmj3A&s=10",
    "Barsha Siwakoti": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz2vJhKaCqLwEDCrH9WLUfu7RCPyOuWqFO_yT4jNtmDQ&s=10",
    "Dipaa Shree Niroula": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJebs3xq5jR3X4W16ypghLcXuA8KJdF8ezRg6CHYn7XQ&s=10",
    "Ramesh Budathoki": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiuHF1N1_rI8haufimk8s0ADaSj1uc1tOxxmSMgvAI3Q&s=10",
    "Prakash Ghimire": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKhLFxNUyN6sjUzUmITMvUcNYQ5T8VpjP3ZuUumZlNbg&s",
    "Shupala Sapkota": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_fjp0MASib_gVAtjvmZRgCzHPSIMUDc_VkO37lffpMit7F-xB0q54Lck&s=10",
    "Sulakshyan Bharati": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkMMe8Ja_qhqy5uPgswnIYlcjame3dhwQP5i1OOULu6w&s=10",
    "Rama Thapaliya": "https://artistnepal.com/storage/images/users/1865294207525327.jpg",
    "Sabin Bastola": "https://www.thefilmnepal.com/uploads/medias/thumbnail-md/sabin-banstola.webp",
    "Samir Bhatt": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt_qN79a2SDyQjGODV5G8YPyFN-pRyrmypQWKtD-agJQs0LbH8X1Awn8a2&s=10",
    "Sonu Chandrapal": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdUdxJpaWhT_zINt53P6mEaLs4vFYRMQtFDQkMWql9ADBDkB8wwnMi4sRs&s=10",
    "Deeya Maskey": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvqBzGxp5ojagGYTtHVnii-MRWfSG0LC1gde-nhKsXYg&s=10",
    "Murali Dhar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAC58YuKn88RspuDgZy3rDC1G6cOh4S55JEjbKLWNDJHvU191LjTVwF8f6&s=10",
    "Sanisha Bhattarai": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy31XDTkKI0ayT3KZZ9Rz_ZIWfD0kfWErB1UTkwfWauzFaiqwQlX7B22-Y&s=10",
    "Nancy Khadka": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKOuRWN9sYtwINekm2Oxv-YOu6NTz2X_upajf_kUa2OauxOOo7Po69mVI&s=10",
    "Kanij Koirala": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjIAx8td74dE_8YWhNqzs5jXuvFQHZD4zKdXf8SLQmeio4VDsUZvLlSH8&s=10",
    "Naren Khadka": "https://surcinema.com/wp-content/uploads/2024/08/Picsart_24-08-11_20-43-36-168_copy_818x545-768x512.jpg",
    "Krishna Bhatta": "https://tfnnew.in-maa-1.linodeobjects.com/uploads/medias/roshan-shrestha.jpg",
    "Kalu Rana": "https://www.lensnepal.com/files/profiles/sushil-pokharel.jpg",
    "Arjun Jung Shahi": "https://artistnepal.com/storage/images/users/1856130829262133.jpg",
    "Shuleman Shankar": "https://www.onlinekhabar.com/wp-content/uploads/2024/10/suleman_shankar_iku-768x469.jpg",
    "Tara Sharma": "https://tfnnew.in-maa-1.linodeobjects.com/uploads/medias/anju-panta.jpg",
    "Asha Magrati": "https://image.tmdb.org/t/p/w500/wNCdEZSQhPHqeHK5YXgqfyIgviH.jpg",
    "Nikita Chandak": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMiIB9jyOGuNY7M-CMwUvphfZZpYyGXks3sqgqdy2Baq4diNDqZcBa6CtL&s=10",
    "Dayahang Rai": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEQ9FhTiASpICqw421csKY10w60TBSfqv4-7uipJ6cbA&s=10",
    "Gaumaya Gurung": "https://www.thefilmnepal.com/uploads/medias/Gaumaya-gurung.webp",
    "Pashupati Rai": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrC9MFAG0pGAKfMuoJUXnf4USxSYfba3h4nSJ9ojjXaw&s=10",
    "Niraj Shrestha": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSp2AJ6gfKEHfsDOmXDVNwZfmwl9YAAtx2x0anPaWUvQ&s",
    "Miruna Magar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTENgcgHCS6TmFDmFiAUtJkc79VVZu4pcwVYqzR_U2Cbw&s=10",
    "Shishir Bangdel": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkAcTiWV8_gw0S2lj2Ad1DtATUJa7A2jsIdYG48Qi2Qg&s=10",
    "Kabita Ale Magar": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM4Pjah7_ERdRP427YQJ89uYykUHvQ6jHbeDAW0cjdYjtc9tef3S5_EKvE&s=10",
    "Pushkar Gurung": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU1X90hYX-2YGlF3tmus9XMQ9IBiwU2hh7VTx10gzESg&s=10",
    "Anu Thapa": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoNlgKHCvllAzmivY9BndbI2knnKqeBKjQ7XRiKKhCvA&s=10",
    "Pradeep Khadka": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRz4cpDS49WcJ9nbD_2ziMbggeebLw9Fg2neSPILpcLQ&s=10",
    "Paul Shah": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm5pzZuTOM68kfIM0f7oT5GbL5g5SiZzVsehoHSCzV9Q&s=10",
    "Parikshya Limbu": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPOBWDdJfEmF5lNUKHbQ2knnvxB-lIwxWv59dWpmmkcw&s=10",
    "Prem Subba": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1rNYHsRRdvH_nj1W0KWd85pIZ99ew55_UFBMlhyDgEg&s=10",
    "Lokendra Lekhak": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOzcm8hoQxGj9olHE2Z2aPIaaYcUFkPhs7T1_hfQuR5g&s=10",
    
};

// Helper: looks up the real photo by name; falls back to an avatar
const createCastMember = (name) => {
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();

    const realPhoto = castPhotoLookup[key];

    return {
        name: trimmed,
        profile_path:
            realPhoto ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                trimmed
            )}&size=200&background=1e40af&color=fff`,
    };
};

// Public list of cast members with photos (for reference / fallback)
export const dummyCastsData = [
    "Rajesh Hamal",
    "Bhuwan K.C.",
    "Nikhil Upreti",
    "Biraj Bhatta",
    "Dayahang Rai",
    "Saugat Malla",
    "Nischal Basnet",
    "Aryan Sigdel",
    "Deepak Raj Giri",
    "Sitaram Kattel",
    "Kedar Ghimire",
    "Karishma Manandhar",
    "Richa Sharma",
    "Priyanka Karki",
    "Namrata Shrestha",
    "Rekha Thapa",
    "Keki Adhikari",
    "Lokendra Lekhak",
    
].map(createCastMember);


export const dummyShowsData = [
    {
        "_id": "1383481",
        "id": 1383481,
        "title": "Sarangi: A Journey of Purna Bahadur",
        "overview": "In the heart of a remote village, Purna Bahadur Ko Sarangi weaves a poignant drama about the unbreakable bond between a struggling father and his son. Purna Bahadur, a humble and impoverished musician, clings to the hope of a better life through his beloved sarangi, an instrument that carries the echoes of his dreams and sacrifices.",
        "poster_path":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTgjALU6HsKMiC_VGey6MdHGTBtqqAQxl9RDLZb5STdg&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN2zyRd8OSecoocHiNvgOzuIBMW2wvCOpomyDbGXxY4w&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10751, "name": "Family" }
        ],
        "casts": [
            createCastMember("Bijay Baral"),
            createCastMember("Anjana Baraili"),
            createCastMember("Prakash Saput"),
            createCastMember("Mukun Bhusal"),
            createCastMember("Buddhi Tamang"),
            createCastMember("Maotse Gurung"),
            createCastMember("Desh Bhakta Khanal"),
            createCastMember("Bhola Raj Sapkota"),
            createCastMember("Binod Neupane"),
            createCastMember("Alisha Bastola"),
            createCastMember("Swayam KC"),
            createCastMember("Jaanbi Poudel")
        ],
        "release_date": "2024-10-31",
        "original_language": "ne",
        "tagline": "A father's dream, a son's journey.",
        "vote_average": 8.5,
        "vote_count": 1200,
        "runtime": 143,
        "theaters": ["QFX Civil Mall", "QFX Labim Mall", "FCube Cinemas", "One Cinemas"]
    },
    {
        "_id": "1407012",
        "id": 1407012,
        "title": "Khusma",
        "overview": "Set in the backdrop and the aftermath of Maoist Insurgency— Khusma endures separation from her husband and awaits his return, only to resign herself to her fate.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWgThKlEueXByylbamItBy6f4mxSzsyt_dG2gtUWuJsA&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH9BU9_O-wytGMFc5BJmCP7kLwsqDYWcVF6ZMVFLnEAQ&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10749, "name": "Romance" }
        ],
        "casts": [
            createCastMember("Dhiraj Magar"),
            createCastMember("Upasana Singh Thakuri"),
            createCastMember("Maotse Gurung"),
            createCastMember("Khadka Bahadur Pun"),
            createCastMember("Sujata Rai"),
            createCastMember("Bijay Sanjog Subba"),
            createCastMember("Raju Resmi Magar"),
            createCastMember("Raj Thapa Kauchha"),
            createCastMember("Astitwa Bhattachan"),
            createCastMember("Sangeeta Thapa Magar"),
            createCastMember("Arun Pun Magar"),
            createCastMember("Sara Rai"),
            createCastMember("Shweta Mishra")
        ],
        "release_date": "2024-09-19",
        "original_language": "ne",
        "tagline": "Love and loss in the time of war.",
        "vote_average": 7.8,
        "vote_count": 800,
        "runtime": 130,
        "theaters": ["QFX Chhaya Center", "QFX Durbar Cinemax", "Jai Nepal Cinemas"]
    },
    {
        "_id": "1368894",
        "id": 1368894,
        "title": "Chhakka Panja 5",
        "overview": "The king is happily living in his country with his family. The ups and downs in his marital life will increase and he will have to leave the country. He will not give his dreams to his desires. He is ready to go abroad. On the other hand, when he tries to find happiness, the emotional boundaries between him and his relatives stop, which makes him hurt. What will the King decide next?",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP9Bt2w_zd59ve5fpgf84bZQxxQb9ps8ifbC8yO8BKwA&s",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPOG7NsARXB1maA_Bnqj2b5K3tVwCVk-vMRHx5g7oPQ&s=10",
        "genres": [
            { "id": 35, "name": "Comedy" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Deepak Raj Giri"),
            createCastMember("Kedar Ghimire"),
            createCastMember("Barsha Siwakoti"),
            createCastMember("Dipaa Shree Niroula"),
            createCastMember("Ramesh Budathoki"),
            createCastMember("Prakash Ghimire"),
            createCastMember("Buddhi Tamang")
        ],
        "release_date": "2024-10-09",
        "original_language": "ne",
        "tagline": "The king is back with more laughter.",
        "vote_average": 6.5,
        "vote_count": 600,
        "runtime": 167,
        "theaters": ["QFX Civil Mall", "QFX Rising Mall", "Ranjana Cineplex", "Bishwojyoti Cineplex"]
    },
    {
        "_id": "1289134",
        "id": 1289134,
        "title": "Boksi Ko Ghar",
        "overview": "A journalist uncovers a tale of abuse whilst investigating witchcraft accusations in a remote village.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-jIgexn2BRScnuBvig0qb7sV0aZ4rTrBPnnOom2Syyg&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnKYbWONtNd1GvjHCZOWMXlqGmTNXkgIgCfi5nAI7uUQ&s=10",
        "genres": [
            { "id": 53, "name": "Thriller" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Keki Adhikari"),
            createCastMember("Shupala Sapkota"),
            createCastMember("Swechchha Raut"),
            createCastMember("Sulakshyan Bharati"),
            createCastMember("Rama Thapaliya"),
            createCastMember("Sushma Niraula"),
            createCastMember("Jiwan Baral"),
            createCastMember("Sabin Bastola")
        ],
        "release_date": "2024-04-26",
        "original_language": "ne",
        "tagline": "The truth hides in the shadows.",
        "vote_average": 7.7,
        "vote_count": 400,
        "runtime": 120,
        "theaters": ["QFX Labim Mall", "One Cinemas", "Guna Cinema"]
    },
    {
        "_id": "1390713",
        "id": 1390713,
        "title": "12 Gaun",
        "overview": "A son's quest for vengeance against a tyrannical village chief who murdered his parents. The chief rules through fear, oppressing villagers with his gang, forbidding escape. The son must confront the chief's ruthless reign to seek justice.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfrP7LTuaxIdq5sXbmXlKAeXFDi4AT9yaIDVqcAKhTZg&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsu48AN5y-vy_aRgdVSFSLkZsYn4W0IJk5rK29a5uVoQ&s=10",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Biraj Bhatta"),
            createCastMember("Samir Bhatt"),
            createCastMember("Sonu Chandrapal"),
            createCastMember("Deeya Maskey"),
            createCastMember("Murali Dhar"),
            createCastMember("Sanisha Bhattarai"),
            createCastMember("Nancy Khadka"),
            createCastMember("Kanij Koirala"),
            createCastMember("Naren Khadka"),
            createCastMember("Krishna Bhatta"),
            createCastMember("Kalu Rana"),
            createCastMember("Arjun Jung Shahi"),
            createCastMember("Bhisham Joshi"),
            createCastMember("Shuleman Shankar"),
            createCastMember("Tara Sharma"),
            createCastMember("Kishore Bhatta")
        ],
        "release_date": "2024-10-10",
        "original_language": "ne",
        "tagline": "Vengeance knows no bounds.",
        "vote_average": 6.5,
        "vote_count": 300,
        "runtime": 147,
        "theaters": ["QFX Civil Mall", "FCube Cinemas", "INI Screenplay Cinemas"]
    },
    {
        "_id": "1383894",
        "id": 1383894,
        "title": "Pooja, Sir",
        "overview": "When two boys are kidnapped in a border town in Nepal, Detective Inspector Pooja is sent from Kathmandu to solve the case. But when she arrives, the brewing political unrest and violent protests throw her off course, and she is forced to seek help from Mamata, a local Madhesi policewoman.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqPoxNjzq3QpXakL37cgX1hE7npYeZJsGBmwDTF9H9zQ&s=10",
        "backdrop_path": "https://image.tmdb.org/t/p/original/poojaSirBackdrop.jpg",
        "genres": [
            { "id": 80, "name": "Crime" },
            { "id": 53, "name": "Thriller" }
        ],
        "casts": [
            createCastMember("Asha Magrati"),
            createCastMember("Nikita Chandak"),
            createCastMember("Dayahang Rai"),
            createCastMember("Reecha Sharma"),
            createCastMember("Bijay Baral"),
            createCastMember("Gaumaya Gurung"),
            createCastMember("Aarti Mandal"),
            createCastMember("Ghanashyam Mishra"),
            createCastMember("Prameshwar Kumar Jha"),
            createCastMember("Pashupati Rai"),
            createCastMember("Niraj Shrestha")
        ],
        "release_date": "2024-09-01",
        "original_language": "ne",
        "tagline": "Justice has a new face.",
        "vote_average": 6.3,
        "vote_count": 200,
        "runtime": 120,
        "theaters": ["QFX Chhaya Center", "One Cinemas"]
    },
    {
        "_id": "1385265",
        "id": 1385265,
        "title": "Gharjwai",
        "overview": "\"Gharjwai\" revolves around the intertwined lives of three main characters: a seasoned farmer, a spirited young woman, and a mysterious stranger. As secrets unravel and emotions collide, the film explores themes of love, sacrifice, and redemption.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDjAHq8RyX8EG4Eh8EU_k6txFOiZNk3CDo5Z6hQNj4aQ&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHLTmu2qJzG7fA-z9cyK2WghMcjnkHFQyrzF98p-KdRw&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10749, "name": "Romance" }
        ],
        "casts": [
            createCastMember("Dayahang Rai"),
            createCastMember("Miruna Magar"),
            createCastMember("Shishir Bangdel"),
            createCastMember("Raj Thapa Magar"),
            createCastMember("Kabita Ale Magar"),
            createCastMember("Buddhi Tamang"),
            createCastMember("Pushkar Gurung"),
            createCastMember("Anu Thapa"),
            createCastMember("Sunil Magar"),
            createCastMember("Bhola Raj Sapkota"),
            createCastMember("Khadga Bahadur Pun")
        ],
        "release_date": "2024-07-12",
        "original_language": "ne",
        "tagline": "Love, sacrifice, and redemption.",
        "vote_average": 7.6,
        "vote_count": 150,
        "runtime": 135,
        "theaters": ["QFX Durbar Cinemax", "Jai Nepal Cinemas"]
    },
    {
        "_id": "1408707",
        "id": 1408707,
        "title": "Pujar Sarki",
        "overview": "Three individuals unite against societal norms perpetuating caste discrimination, facing challenges in their collective struggle to defy the existing caste-based social order.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwR3SPZsF7_YaK-JAWBqfOoT7BalfMddbo6tzUbAuR0w&s",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStJHb7h31a-ls9J802akr61r26aq6AbSnegsZygteE0A&s=10",
        "genres": [
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Aryan Sigdel"),
            createCastMember("Pradeep Khadka"),
            createCastMember("Paul Shah"),
            createCastMember("Anjana Baraili"),
            createCastMember("Parikshya Limbu"),
            createCastMember("Prem Subba"),
            createCastMember("Lokendra Lekhak"),
            createCastMember("Mohan Niroula"),
            createCastMember("Subash Gajurel"),
            createCastMember("Tara Sharma"),
            createCastMember("Bidhya Karki"),
            createCastMember("Shankar Acharaya"),
            createCastMember("Basant Bhatt"),
            createCastMember("Govinda Parajuli")
        ],
        "release_date": "2024-05-16",
        "original_language": "ne",
        "tagline": "Fighting for a better tomorrow.",
        "vote_average": 8.1,
        "vote_count": 100,
        "runtime": 138,
        "theaters": ["QFX Labim Mall", "Kirtipur Cineplex", "Metro Plaza Cinema Complex"]
    },
    {
        "_id": "1383898",
        "id": 1383898,
        "title": "Mummy",
        "overview": "After the tragic loss of their beloved family dog, a daughter adopts a mysterious black cat, unwittingly inviting dark forces that threaten to tear her family apart.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq3h40dy7V3nOJ6Wvhkyh4UcS2X7k9XI-TJ1co-N18TA&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6THT2ZrPVNWNpc07Jd_5xBbHmlJ2jdn80WMyAyPPGXw&s=10",
        "genres": [
            { "id": 27, "name": "Horror" }
        ],
        "casts": [
            createCastMember("Priyanka Karki"),
            createCastMember("Sulakshyan Bharati"),
            createCastMember("Deeya Maskey"),
            createCastMember("Shri Krishna Niraula"),
            createCastMember("Aayushi Dhakal"),
            createCastMember("Jvis Shrestha"),
            createCastMember("Ghanashyam Joshi"),
            createCastMember("Geet Bista"),
            createCastMember("Gurans Dhakal"),
            createCastMember("Hari Kuma Bhandari"),
            createCastMember("Mahendra Mainali"),
            createCastMember("Prakash Ban")
        ],
        "release_date": "2025-02-07",
        "original_language": "ne",
        "tagline": "Some secrets should stay buried.",
        "vote_average": 5.8,
        "vote_count": 80,
        "runtime": 124,
        "theaters": ["QFX Civil Mall", "QFX Thimi", "City Square Mall (QFX)"]
    },
    {
        "_id": "1383488",
        "id": 1383488,
        "title": "Eternal Kinship",
        "overview": "After unforeseeably running away with her lover, 10 year old Suresh must deal with the ordeal of life without a sister figure.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdUySXMbRm0q_mMgzc0XbCT8jbaPrkNz0be-8JUbbFUw&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHuBUZ7zW0yjQGx9N8X4tG4YQX2SPp_OO-C6Be7yIMo45btS4H8HmCI7s&s=10",
        "genres": [
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Gauranga Banjara"),
            createCastMember("Anjasha Rijal")
        ],
        "release_date": "2025-07-21",
        "original_language": "ne",
        "tagline": "Family ties never break.",
        "vote_average": 7.0,
        "vote_count": 50,
        "runtime": 110,
        "theaters": ["Mandala Theatre", "MidTown Cinemas"]
    },
    {
        "_id": "1345678",
        "id": 1345678,
        "title": "Jwai Saab",
        "overview": "Disheartened by his home life, Gobardhan's fate takes a turn when he hears an advertisement on the radio offering the chance to become a live-in son-in-law. After winning several competitions with great effort, Gobardhan embarks on the unpredictable journey of becoming a husband in a traditional Nepali setting.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt-X06cEehjvXk41QF-QKRzlMGyMLm50X1xJ8o-vq1vw&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkBHnPhhMq_NLjVREptQRjfLcn_srxsQriXsDRq6udrg&s=10",
        "genres": [
            { "id": 35, "name": "Comedy" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Jitu Nepal"),
            createCastMember("Niti Shah"),
            createCastMember("Buddhi Tamang"),
            createCastMember("Himesh Pant"),
            createCastMember("Kamalmani Nepal"),
            createCastMember("Prakash Ghimire"),
            createCastMember("Shishir Bangdel"),
            createCastMember("Ramesh Budhathoki"),
            createCastMember("Kavita Ale"),
            createCastMember("Wilson Bikram Rai"),
            createCastMember("Shivu Pandey")
        ],
        "release_date": "2024-10-10",
        "original_language": "ne",
        "tagline": "A journey of love and responsibility.",
        "vote_average": 7.0,
        "vote_count": 120,
        "runtime": 155,
        "theaters": ["QFX Rising Mall", "Ranjana Cineplex", "INI Lotse Cinemas"]
    },
    {
        "_id": "1413287",
        "id": 1413287,
        "title": "Gunyo Cholo: A Girl Coming of Age Story",
        "overview": "Gulabi is a transwoman groomed by her patriarchal father to join the military. When her father disowns her, Gulabi ends up living a life of prostitution in Kathmandu.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBJ6jqD312ZJRDZEL7tNRTgICaz-qZGeoRANb4n0X1Dw&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2QZFn-bftnlzxahQLh7D9ADkYQ9IYo1FNWYgbDlyvHg&s=10",
        "genres": [
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Nazir Hussain"),
            createCastMember("Sanchita Luitel"),
            createCastMember("Sushil Sitaula"),
            createCastMember("Raj Kumar Ghosh"),
            createCastMember("Shishir Rana"),
            createCastMember("Anupam Shrestha"),
            createCastMember("Bishal Pahari")
        ],
        "release_date": "2024-10-25",
        "original_language": "ne",
        "tagline": "A story of identity and survival.",
        "vote_average": 6.8,
        "vote_count": 90,
        "runtime": 120,
        "theaters": ["QFX Labim Mall", "Mandala Theatre"]
    },
    {
        "_id": "1408443",
        "id": 1408443,
        "title": "Maijharo",
        "overview": "A man's desperate fight to save his father's graveyard from a powerful businessman is complicated by the return of his former lover.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJmQVaHChMc-5ZIMo_SPk91VtyoUTgVAnB83-bL0jX-g&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTakgAQ2x2rr8KCXrWM6hBa6651QWqkCarcpWhk2GSmw&s",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10749, "name": "Romance" }
        ],
        "casts": [
            createCastMember("Dhiraj Magar"),
            createCastMember("Miruna Magar"),
            createCastMember("Deeya Pun"),
            createCastMember("Wilson Bikram Rai"),
            createCastMember("Maotse Gurung"),
            createCastMember("Buddhi Tamang"),
            createCastMember("Puskar Gurung"),
            createCastMember("Sunil Thapa"),
            createCastMember("Kabita Ale"),
            createCastMember("Abhayraj Baral"),
            createCastMember("Uday Subba"),
            createCastMember("Rajani Gurung"),
            createCastMember("Bishal Limbu"),
            createCastMember("Subhash Singh Thakuri"),
            createCastMember("Dayahang Rai")
        ],
        "release_date": "2025-10-24",
        "original_language": "ne",
        "tagline": "Love, land, and the weight of the past.",
        "vote_average": 7.2,
        "vote_count": 70,
        "runtime": 139,
        "theaters": ["QFX Civil Mall", "QFX Durbar Cinemax"]
    },
    {
        "_id": "1418956",
        "id": 1418956,
        "title": "Balidan",
        "overview": "In the remote corner of the country lies Bhilmaghat, a village that looks like paradise from the outside. Beneath its beauty hides a kingdom of exploitation and fear ruled by a hypocritical priest 'Baba'. A boy named Abhay survives a horrific ritual sacrifice with the help of Bhavani, who plants the seed of revolt—only to lose her husband in a direct clash with Baba. Years later, Abhay returns to seek vengeance.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhCYhPf7TZeGiwy2Tsqvsa1ldxSffScZ4IPLp5FicJyg&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrIKaVZyNny5A2BqTb5K9r4I4aS12Zdj2r6-iEYNZIcA&s=10",
        "genres": [
            { "id": 28, "name": "Action" },
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Samir Bhatt"),
            createCastMember("Saugat Malla"),
            createCastMember("Reecha Sharma"),
            createCastMember("Arpan Thapa"),
            createCastMember("Hemanta Budathoki"),
            createCastMember("Kavita Raya"),
            createCastMember("Kameshor Chaurasiya"),
            createCastMember("Prajal Dulal"),
            createCastMember("Jeevan Baral"),
            createCastMember("Ritesh Jung Poudel"),
            createCastMember("Sunil Chhettri")
        ],
        "release_date": "2025-09-29",
        "original_language": "ne",
        "tagline": "When faith becomes fear, one man must rise.",
        "vote_average": 4.7,
        "vote_count": 60,
        "runtime": 135,
        "theaters": ["QFX Civil Mall", "FCube Cinemas", "One Cinemas"]
    },
    {
        "_id": "1416319",
        "id": 1416319,
        "title": "Maitighar",
        "overview": "Maitighar follows Maya, a widow struggling to raise her son after her husband's death. Facing societal judgment and hardships, she battles to rebuild her life, highlighting themes of love, loss, and resilience in a conservative society.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVc-cVmvC8Esph2HctK2-4rY7ODb7PeQL_3y6-bEE_jA&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuZ3p6rWoHW64uSjXM4hYetY4pBZQG7oNwvwUf20QP5A&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10749, "name": "Romance" }
        ],
        "casts": [
            createCastMember("Kedar Prasad Ghimire"),
            createCastMember("Dhiraj Magar"),
            createCastMember("Prakash Saput"),
            createCastMember("Upasana Singh Thakuri"),
            createCastMember("Shyamashree Sherpa"),
            createCastMember("Yubaraj Lama"),
            createCastMember("Buddhi Tamang")
        ],
        "release_date": "2025-09-29",
        "original_language": "ne",
        "tagline": "A mother's journey of resilience.",
        "vote_average": 7.0,
        "vote_count": 50,
        "runtime": 127,
        "theaters": ["QFX Chhaya Center", "Jai Nepal Cinemas", "Bishwojyoti Cineplex"]
    },
    {
        "_id": "1419904",
        "id": 1419904,
        "title": "Jerry on Top",
        "overview": "Jerry On Top is a Nepali romantic drama that continues the emotional journey of Jerry, a charming yet introspective young man. Returning to Nepal after years abroad, Jerry seeks to reconnect with his roots and rediscover meaning in life beyond fleeting fame and relationships. His path crosses with Aanchal, a passionate and grounded woman who challenges his worldview and inspires him to grow emotionally.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW9HH43yO6Zf8cubElhc8fKnqvZuIevMVAog5OTNZ6YA&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1XoExE27lMTTNIfuCb31lGSF0otKiQ5IQrOHZm8R3ug&s=10s",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10749, "name": "Romance" }
        ],
        "casts": [
            createCastMember("Anmol KC"),
            createCastMember("Bhuwan KC"),
            createCastMember("Aanchal Sharma"),
            createCastMember("Jassita Gurung"),
            createCastMember("Kedar Ghimire"),
            createCastMember("Usha Khadgi")
        ],
        "release_date": "2025-10-17",
        "original_language": "ne",
        "tagline": "Redemption, love, and starting anew.",
        "vote_average": 8.0,
        "vote_count": 150,
        "runtime": 180,
        "theaters": ["QFX Civil Mall", "QFX Labim Mall", "One Cinemas", "FCube Cinemas"]
    },
    {
        "_id": "1422453",
        "id": 1422453,
        "title": "Aa Bata Aama",
        "overview": "Aa Bata Aama is a heartfelt story set in a serene Nepali village, following a loving couple who are blessed with a son, Krishna, after years of hope and prayer. The film explores the deep bond between a mother and her son as he prepares to travel abroad for a better future.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToE-CQV0l912Ll2r6ZhdhW9ElvZJNu_NQN8tHvReC73Q&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT43MoLZVWpJkbJ-dfSVSUFtgDhqAO_7Wo6sP2IiSeqIw&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10751, "name": "Family" }
        ],
        "casts": [
            createCastMember("Paul Shah"),
            createCastMember("Bipana Thapa"),
            createCastMember("Pradeep Rawat"),
            createCastMember("Simran Pant"),
            createCastMember("Saigrace Pokharel"),
            createCastMember("Usha Uppreti"),
            createCastMember("Rabindra Jha"),
            createCastMember("Gajit Bista"),
            createCastMember("Begam Nepali"),
            createCastMember("Prakash SJB Kunwar"),
            createCastMember("Samaira Thapa"),
            createCastMember("Shan Adhikari")
        ],
        "release_date": "2026-01-30",
        "original_language": "ne",
        "tagline": "A mother's love knows no distance.",
        "vote_average": 7.6,
        "vote_count": 80,
        "runtime": 160,
        "theaters": ["QFX Durbar Cinemax", "MidTown Cinemas", "City Square Mall (QFX)"]
    },
    {
        "_id": "1425581",
        "id": 1425581,
        "title": "Unko Sweater",
        "overview": "A tender romantic drama set in the serene hills of eastern Nepal. The film explores the quiet bond between Dharanidhar Kafle, a reserved young man from a traditional Brahmin family, and Phool, a spirited girl from the Gurung community, as they navigate love, culture, and family expectations.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLiepWzIqusSece65I1g8XHuYfVmtpJhjSwaC22qywVA&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTISGdyLOaUBRmkBiLFgQxnNhkUenk4rbBQFI55nTkAog&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10749, "name": "Romance" }
        ],
        "casts": [
            createCastMember("Bipin Karki"),
            createCastMember("Miruna Magar"),
            createCastMember("Parikshya Limbu"),
            createCastMember("Alex Paras"),
            createCastMember("Sunil Pokharel"),
            createCastMember("Maotse Gurung"),
            createCastMember("Wilson Bikram Rai"),
            createCastMember("Prem Subba"),
            createCastMember("Suraj Tamu"),
            createCastMember("Bhawana Khapangi Magar")
        ],
        "release_date": "2025-05-09",
        "original_language": "ne",
        "tagline": "A journey of warmth and human connections.",
        "vote_average": 8.5,
        "vote_count": 110,
        "runtime": 132,
        "theaters": ["QFX Civil Mall", "QFX Labim Mall", "INI Screenplay Cinemas"]
    },
    {
        "_id": "1428712",
        "id": 1428712,
        "title": "Jaari 2: Song of Chyabrung",
        "overview": "Continuing the story of the first film, Jaari 2 follows the journey of Namsang and his wife Hangma as they embark on a new chapter of their married life. The film's narrative is deeply rooted in the culture of the Limbu community and revolves around the Chyabrung, a traditional drum that symbolizes love, identity and resilience.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ05z33zJnpz6FJuTz2YTpbGGmyx3LxDfFB5L3DWBOcwA&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDzAgJw-qxpBKxVMyXg1gnfhTkSDqh6uWnd9gyWOyCeA&s=10",
        "genres": [
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Dayahang Rai"),
            createCastMember("Miruna Magar"),
            createCastMember("Bijay Baral"),
            createCastMember("Buddhi Tamang"),
            createCastMember("Reecha Sharma"),
            createCastMember("Pushkar Gurung"),
            createCastMember("Prem Subba"),
            createCastMember("Maotse Gurung"),
            createCastMember("Kamalmani Nepal"),
            createCastMember("Manhang Lawati"),
            createCastMember("Bishnu Moktan"),
            createCastMember("Anil Subba")
        ],
        "release_date": "2025-11-07",
        "original_language": "ne",
        "tagline": "Tradition, love, and resilience.",
        "vote_average": 7.1,
        "vote_count": 70,
        "runtime": 127,
        "theaters": ["QFX Chhaya Center", "One Cinemas", "Kirtipur Cineplex"]
    },
    {
        "_id": "1429905",
        "id": 1429905,
        "title": "Lalibazar",
        "overview": "LALIBAZAR is a powerful social drama that explores the harsh socioeconomic realities and generational struggles of Nepal's marginalized Badi community. The story follows a mother's unwavering sacrifice to protect and educate her daughter, fighting against systemic exploitation while striving to secure a better future.",
        "poster_path": "https://m.media-amazon.com/images/M/MV5BMWI3NzFiOTgtMTFiMi00NTAxLTg0NGUtNDEzNTc5Yjc0NTM5XkEyXkFqcGc@._V1_.jpg",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsKHwwfy48qcX_cjKP76mg_E6J70pM4D65SjvgnBOUuiCqAaNtZxRsFWsc&s=10",
        "genres": [
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Swastima Khadka"),
            createCastMember("Rabindra Singh Baniya"),
            createCastMember("Samaira Thapa"),
            createCastMember("Mukunda Kumar Shrestha"),
            createCastMember("Abhay Baral"),
            createCastMember("Prem Pandey"),
            createCastMember("Asha Poudel"),
            createCastMember("Govinda Sunar"),
            createCastMember("Abha Aryal"),
            createCastMember("Tara Sharma"),
            createCastMember("Saraswati Adhikari"),
            createCastMember("Janaki Kathayat"),
            createCastMember("Nischal Panthi"),
            createCastMember("Birbal Chaudhary"),
            createCastMember("Bishal Devkota"),
            createCastMember("Prashansa Subedi")
        ],
        "release_date": "2026-05-08",
        "original_language": "ne",
        "tagline": "A mother's fight for a better tomorrow.",
        "vote_average": 8.0,
        "vote_count": 50,
        "runtime": 137,
        "theaters": ["QFX Civil Mall", "Mandala Theatre", "Asta Narayan Pictures"]
    },
    {
        "_id": "1431123",
        "id": 1431123,
        "title": "Roll No. 1",
        "overview": "A story of a boy struggling to fulfill his father's dream of winning a scholarship from the government. Set against the backdrop of rural Nepal, the film dives deep into student life, the education system, and the psychological pressure faced by children.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgJH9Lp2Y9pnP5gc2kgGdGs7FChkkTv6W6ZqZhWv2vEPr5AfA7A2TyT90&s=10",
        "backdrop_path": "https:https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRkshPk0sSX2OBR-i_ItFbxwBNis9k7atla7g5QFlaGg&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10751, "name": "Family" }
        ],
        "casts": [
            createCastMember("Mukun Bhusal"),
            createCastMember("Renu Yogi"),
            createCastMember("Nirbhik Regmi"),
            createCastMember("Sushank Mainali"),
            createCastMember("Lokendra Lekhak"),
            createCastMember("Avon Raj Upreti"),
            createCastMember("Subash Pd Gajurel"),
            createCastMember("Srijana Adhikari"),
            createCastMember("Rinchen Lama"),
            createCastMember("Sanyam Katuwal"),
            createCastMember("Sijal Shrestha")
        ],
        "release_date": "2026-05-29",
        "original_language": "ne",
        "tagline": "A father's dream, a son's struggle.",
        "vote_average": 7.5,
        "vote_count": 40,
        "runtime": 130,
        "theaters": ["QFX Labim Mall", "MidTown Cinemas"]
    },
    {
        "_id": "1433584",
        "id": 1433584,
        "title": "Anjila",
        "overview": "Based on the real-life story of Anjila Tumbapo Subba, the captain and number one goalkeeper of Nepal's national women's football team. The film traces her rise from a restrictive home life to leading the squad, highlighting her struggles against social expectations.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6YslyjO-vGh-HemItmUKBgXFTo4n7FPA93XZvTvJAMA&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1VbHsqC3990ZziUNkFqXTTHiNQEgNI24TuW_Wr2TZ9Q&s=10",
        "genres": [
            { "id": 18, "name": "Drama" },
            { "id": 10751, "name": "Family" }
        ],
        "casts": [
            createCastMember("Anjila Tumbapo Subba"),
            createCastMember("Dayahang Rai"),
            createCastMember("Srijana Subba"),
            createCastMember("Maotse Gurung"),
            createCastMember("Bijay Baral"),
            createCastMember("Buddhi Tamang"),
            createCastMember("Prem Kumar Shrestha"),
            createCastMember("Sunil Thapa"),
            createCastMember("Manju Shrestha"),
            createCastMember("Suraj Tamu"),
            createCastMember("Birup Ghale"),
            createCastMember("Baldip Rai"),
            createCastMember("Bedana Rai")
        ],
        "release_date": "2025-03-13",
        "original_language": "ne",
        "tagline": "The inspiring journey of a goalkeeper.",
        "vote_average": 7.4,
        "vote_count": 60,
        "runtime": 135,
        "theaters": ["QFX Durbar Cinemax", "FCube Cinemas", "One Cinemas"]
    },
    {
        "_id": "1435718",
        "id": 1435718,
        "title": "Paran",
        "overview": "Paran is a heartfelt family drama about Dharmanath, who treasures his children as his 'essence of life' and dreams of growing old in their love. Set in Dhankuta, the film beautifully portrays love, legacy, and the true meaning of family, focusing on emotional relationships and companionship rather than physical existence.",
        "poster_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPGmlcgjFt91Fm-J_Jd41TFKC1jpGczfkOvpDLvuSlMg&s=10",
        "backdrop_path": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQpxPyGBCv6n5JduWHR5iGaomLnk1DeHwmzB9t-bbmpA&s=10",
        "genres": [
            { "id": 18, "name": "Drama" }
        ],
        "casts": [
            createCastMember("Neer Bikram Shah"),
            createCastMember("Madan Krishna Shrestha"),
            createCastMember("Keki Adhikari"),
            createCastMember("Prabin Khatiwada"),
            createCastMember("Buddhi Tamang"),
            createCastMember("Mahesh Tripathi"),
            createCastMember("Anjana Baraily"),
            createCastMember("Puja Chand"),
            createCastMember("Subash Gajurel"),
            createCastMember("Yaman Shrestha"),
            createCastMember("Yaseli Yonghang"),
            createCastMember("Babin Rai"),
            createCastMember("Pushparaj Ojha")
        ],
        "release_date": "2025-10-31",
        "original_language": "ne",
        "tagline": "Driven not by breath, but by togetherness.",
        "vote_average": 7.8,
        "vote_count": 90,
        "runtime": 167,
        "theaters": ["QFX Civil Mall", "QFX Chhaya Center", "QFX Labim Mall", "INI Lotse Cinemas"]
    }
]

// =====================================================
// DUMMY THEATERS (Kathmandu Valley)
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
        latitude: 27.7290,
        longitude: 85.3181,
    },
];