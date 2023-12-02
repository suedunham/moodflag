# Moodflag

This will eventually be a theme for the [foobar2000 music
player](https://www.foobar2000.org/). For now, it holds some of the constituent
parts of that theme.

Moodflag is currently being developed on foobar2000 version 2, and the goal is
to make both 32-bit and 64-bit versions. Many of the pieces may work on version
1 as well, though that hasn't been verified. It did start out on that version
though. Moodflag is primarily a [Columns
UI](https://www.foobar2000.org/components/view/foo_ui_columns) theme, though
some experiments have been done with the default UI too.

## JavaScript panels

The 32-bit version is based on the [Spider Monkey
Panel](https://www.foobar2000.org/components/view/foo_spider_monkey_panel), and
several scripts are present for that component. They are modifications of
existing scripts, since I, uh, don't actually know JavaScript. If some of the
decisions made seem questionable, this is probably because I don't know any
better.

That component has not yet been made compatible with 64-bit foobar2000.
Accordingly, some of the scripts have also been ported to the [JScript Panel
3](https://github.com/jscript-panel/release/releases), which has.

* `albumart_mod.js` is taken from the `albumart.js` sample distributed with the
  Spider Monkey Panel. An unused parameter has been employed to add a
  customizable transparency to the image. This is a quick and dirty way of
  toning down bright covers in a dark theme.

* `catrox_playlist.js` is the playlist viewer crudely hacked out of the
  [CaTRoX_QWR theme](https://github.com/TheQwertiest/CaTRoX_QWR) and used in
  standalone fashion. Another script, `catrox_common.js`, is from there as well
  as a dependency. The requirement for the unofficial `UI_Hacks` component has
  been commented out. The scripts probably have to be installed in the same
  fashion as the entire theme would be, but it's been a while.

  There are no plans to port this baby to the JScript Panel.

* `statusbar.js` **Coming Soon** There is still a bug in this one that needs to
  be stomped before it gets out. It is another modification of a SMP sample.

* `text_scroller.js` was taken from the [TripleQ
  theme](https://github.com/raphaelquast/foobar2000_TripleQ). It is an item
  detail panel that can scroll values too long for its width. It has been
  heavily modified to be more easily customized.
