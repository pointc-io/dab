# Anti-Spyware (Burner) Fingerprint

There exists many identifiable pieces of information available to the Javascript
environment in modern web browsers. Some pieces more unique (or valuable) than
others, but together it can uniquely identify a person with remarkable precision.


What?
------------------------------------------------------------------------------------
Trackers (Spyware) use browser fingerprinting, cookies, IP addresses, etc to keep tabs on
a uniquely identifiable user.

This is a different approach to fight back against trackers. Instead of "blocking"
trackers, we use misdirection.

Just like a Burner Phone, this is a Burner Browser. When you are done, you can
burn your online identity.


Burner Phone and now Burner Browsers
------------------------------------------------------------------------------------
Just like a Burner Phone, this is a Burner Browser. When you are done, you can
burn your online identity. The user still has a responsiblity to not provide
personal data to websites.


Why not just change the User Agent?
------------------------------------------------------------------------------------
It's a bit more complicated than that ;-)

The user agent which is available in 2 places (Navigator.prototype and HTTP header)
is just piece and not even the most unique by a long shot. Furthermore, if all you
did was change a user agent to something of a different platform then it is for
easy to identify the browser as "suspect" with the environment clearly tampered with.


Is this Anti-Anti-Fraud?
------------------------------------------------------------------------------------
Funny thing about "Anti-Fraud" is that it tracks your fingerprint and IP without
your permission (because who would actively give permission for that). The term
"Anti-Fraud" is overused and incorrect in the context of "tracking". This solution
has nothing to do with fraud and is all about a user's privacy.


What about TOR Project?
------------------------------------------------------------------------------------
TOR strips as much fingerprinting vectors as possible. The result has 2 important
consequences.
1. Browser is NOT uniquely identified
2. Browser clearly appears to have been tampered with

What TOR lacks is the ability to blend in and NOT reveal itself. It's not one of
it's goals so it's not a missing feature. TOR IP addresses are also flagged
as being from TOR. All this means is that "trackers" know you are on TOR even
if they can't locate you. They may censor content accordingly.


Supported Platforms
------------------------------------------------------------------------------------
This content-script utilizes the standard Web Extension API that is now a
global standard.

- Chrome - 65.0+
  - macOS
  - Windows
  - Linux
  
- Opera - 52.0+
  - macOS
  - Windows
  
- Firefox - 58.0+ (Quantum)
  - macOS
  - Windows
  - Linux

- Edge*
  - Windows

- Safari*
  - macOS

- Vivaldi
- Yandex

*** In development ***

How?
------------------------------------------------------------------------------------
Modifies properties used to create a javascript Browser Fingerprint. The goal
is to appear like a normal unsuspecting user with no direct counter-measures
implemented. Just another "unique" user begging to be tracked :).


How do we create unique Fingerprints?
------------------------------------------------------------------------------------
We model fingerprints off of real traffic. We buy real traffic and collect
profile data that we use to generate unique profiles. We DO NOT collect personal
information or "track" anybody. This means that the fingerprint engine is
generating "real" looking fingerprints off of the current distribution of browsers
being used in the world.


Tamper Proofing
------------------------------------------------------------------------------------
"toString()" can leak the fact that javascript properties were changed.
Intelligent "anti-fraud" / "spyware" can use that information to block, censor
and track the user. This script utilizes techniques to render those attacks
useless.


Same Platform Strategy
------------------------------------------------------------------------------------
ALWAYS use the same platform that the patch is spoofing. For example run the
patch on Chrome for Chrome profiles, Firefox for Firefox and so on. The reason
is that it isn't feasible or possible to spoof discordant platforms in their
entirety without patching the core engine which is not a good move :). For example
Firefox has lots of properties that begin with "moz". Those properties are in CSS
and various system javascript object prototypes, some of which are sealed.


Latest Version Strategy
------------------------------------------------------------------------------------
Features are being added to modern browsers at a very fast pace. Furthermore,
these browsers also employ very aggressive auto-updaters. Supporting older versions
and all the minute differences between them is a waste of time. Instead, these
patches are applied to the latest versions which make them appear to have upgraded.


WebGL, Canvas, getClientRect(s)
------------------------------------------------------------------------------------
A random static modifier(s) that are generated when the fingerprint profile
was created. DOMRect's are adjusted accordingly. "toDataURL()" is hijacked
and the image is statically modified based on modifiers. This results in a
unique yet consistent result.
