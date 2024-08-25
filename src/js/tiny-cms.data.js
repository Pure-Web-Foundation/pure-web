export const cmsData = {
  "/publications": {
    children: {
      "/strategic-cto": {
        title: "The CTO Role",
        children: {
          "/five-things-you-should-know-about-the-cto-role":{
            title: "5 Things Founders, Investors and Recruiters Should Know about the CTO role",
            url: "https://medium.com/cto-as-a-service/5-things-founders-investors-and-recruiters-should-know-about-the-cto-role-a65d7bb66264",
            body: `the role of CTO is one of the most misunderstood roles in tech.

For a part, this might have to do with the rise of the so-called “startup-CTO”, a role name that seems to have been introduced by VCs, and is actually more of a tech lead for early startups.

Let’s try and clear things up a bit, by answering the 5 questions I get the most about the role.`
          },
          "/the-box-metaphor": {
            url: "https://medium.com/cto-as-a-service/taking-the-last-hurdle-to-become-a-cto-7a4e2180bf04",
            title: "A CTO works on the Box",
            img: "/assets/img/caas/publications/box-cat.webp",
            alt: "A CTO works on the Box",
            tags: ["box", "strategy"],
            body: `Picture a box. Let’s say that the box stands for everything operational: the rules of the game, the policies, the agile and ALM processes, the software delivery itself, the cultural setup, the reporting lines, the onboarding process, etc.

##The Box Metaphor

As a CTO, you’re continuously inspecting ‘the box’, trying to see where you could improve it, to align better with the business objectives, or to adjust based on these changing objectives.

Because Strategy means thinking about where you want to be in the medium/long term, and adjusting the system to increase the chances of getting there.`,
          },
          "/no-idea": {
            url: "https://www.linkedin.com/posts/mvneerven_cto-engineeringmanager-leaddeveloper-activity-7059105630845841408-dGED",
            title: "CTO? What's that?",
            img: "/assets/img/caas/publications/cto.webp",
            alt: "The CTO role",
            body: `Uncomfortable truth: many people have no idea what a CTO is.


My personal guess is that the Startup World is to blame for this.

Why?

Startups all want a CTO, but don't have the money to get an experienced one, and need hands to build out their first MVP.

Plus, they need someone to push forward when talking to possible investors.

Hence the rise of the "Startup CTO", which is not a CTO at all.

Instead, it's a Lead Developer who codes more than anything else, and doesn't have the skill set (yet) to handle any strategic tasks.`,
          },
          "/primary-job": {
            url: "https://www.linkedin.com/feed/update/urn:li:activity:7138107681612918785/",
            title: "Eric Ries' definition of the CTO",
            img: "/assets/img/caas/publications/ries-quote.webp",
            alt: "Eric Ries' definition of the CTO",
            body: `“The CTO’s primary job is to make sure the company’s technology strategy serves its business strategy” — Eric Ries.

It's as simple as that.

But a lot follows from it. Which is why I've written two articles about it.`,
          },


        },
      },
      "/development-cloud": {
        title: "Software Engineering & Cloud",
        children: {
          "/double": {
            url: "https://medium.com/cto-as-a-service/if-adding-more-engineers-doesnt-speed-up-our-development-what-does-4438bd030b4c",
            title: "Doubling the amount of Engineers",
            img: "/assets/img/caas/publications/double.webp",
            alt: "Doubling the amount of Engineers",
            body: `The idea that hiring more developers will lead to faster time-to-market, is a common misconception.

If only it were that simple.

Instead, we should start with figuring out what’s actually going on, because software development is a complex beast.`,
          },
          "/cloud-horror": {
            url: "https://www.linkedin.com/posts/mvneerven_cloud-nativecloud-datacenter-activity-7142467634104602625-f4nU",
            title: "Cloud Horror is Not What You Think",
            img: "/assets/img/caas/publications/cloud-demon.webp",
            alt: "Cloud Horror is Not What You Think",
            body: `Nice title for a little tech anecdote on LinkedIn, right?

Especially since we've been reading quite a few of these little "don't move to cloud" and "get out of cloud" stories here.

Kind of jumping on the bandwagon 😏...

But please bear with me. I promise this one is different!

💡 Cloud Horror is when you don't know what you're doing and you just use cloud as your 𝙬𝙖𝙖𝙖𝙖𝙖𝙖𝙖𝙖𝙮 𝙘𝙤𝙤𝙡𝙚𝙧 data center.

That's the real Cloud Horror 👿.

As I've been saying for a long time, you can only truly benefit from cloud when you go all-in, meaning that you drop the silly vendor-lock-in reasoning ¹ (while being smart about moving clouds if necessary).`,
          },
          "/microservices-are-overkill": {
            url: "https://www.linkedin.com/posts/mvneerven_startups-cto-fcto-activity-7023968777629245440-Wrpj",
            title: "Microservices are overkill for 99% of startups!",
            img: "/assets/img/caas/publications/microservices-post.webp",
            alt: "Stating the obvious on LinkedIn",
            body: `Microservices are overkill for 99% of startups!

But Monoliths suck!

So what do we do?


There's growing consensus that microservices are not such a great idea for most startups. In fact, only true unicorns might actually profit from a Microservices implementation of their apps.

The reasoning is that, once distributed, problems gets exponentially harder to deal with.

But we all learnt to see monoliths as The Devil 😈!

Enter the Modular Monolith.

But how do I build such a thing?
`,
          },
        },
      },
      "/web-standards": {
        title: "Web Standards",
        children: {
          "/pure-pwa": {
            url: "https://medium.com/cto-as-a-service/purepwa-a-radical-u-turn-in-web-development-a386c0dc092e",
            title: "PurePWA — A Radical U-Turn in Web Development",
            img: "/assets/img/caas/publications/pure-pwa-mobile.webp",
            alt: "",
          },
          "/devops-culture": {
            url: "https://www.linkedin.com/feed/update/urn:li:activity:7117807714260422656/",
            title: "DevOps is a Culture",
            img: "/assets/img/caas/publications/DevOpsCulture.webp",
            alt: "DevOps is a Culture",
            body: `Dear Cloud Enthusiasts,
Just a quick reminder: DevOps is not a Role. It's a Culture!

The other day, a LinkedIn Collaborative Article called "How can DevOps engineers keep cloud projects cost-effective?" triggered me to mutter "WTF, LinkedIn?", after which I added a comment in the "What else to consider" section (because you can't comment on the title itself) ¹.

It's a flawed question, because Cloud should not be considered an afterthought, where architects design a solution, developers build it, testers test it, and DevOps engineers do some infrastructural magic to release it on a Cloud Platform. 🤯

DevOps is not a role. It's a mindset. A culture.
`,
          },
          "/introducing-pure-pwa": {
            url: "https://www.linkedin.com/posts/pure-pwa_purepwa-pwa-progressivewebapps-activity-7167152575773937665-ncd7",
            title: "A working PWA with just Web Standards",
            img: "/assets/img/caas/publications/pure-pwa-einstein.webp",
            alt: "",
          },
          "/80-percent-of-web-apps-could-have-been-a-pwa": {
            url: "https://www.linkedin.com/feed/update/urn:li:activity:7102596530280230912/",
            title: "80% of Mobile Apps could have been a PWA",
            img: "/assets/img/caas/publications/mobile-pwa.webp",
            alt: "80% of Apps could have been a PWA",
          },
          "/year-of-the-pwa": {
            url: "https://www.linkedin.com/posts/mvneerven_purepwa-pwa-yearofthepwa-activity-7164547633846411264-6dUL",
            title: "The Year of the PWA",
            img: "/assets/img/caas/publications/year-of-pwa.webp",
            alt: "The Year of the PWA",
          },
          "/embrace-the-standards": {
            url: "https://javascript.plainenglish.io/embracing-the-beauty-of-the-standards-in-2023-web-development-29dbeece2966",
            title: "Embracing Web Standards",
            img: "/assets/img/caas/publications/embrace-web-standards.webp",
            alt: "Embracing Web Standards",
          },
          "/pure-manifesto": {
            url: "https://medium.com/cto-as-a-service/the-pure-manifesto-for-web-standards-based-design-systems-d46f400853eb",
            title: "The PURE Manifesto",
            img: "/assets/img/caas/publications/pure-manifesto.webp",
            alt: "The PURE Manifesto",
          },
        },
      },
    },
  },
};
