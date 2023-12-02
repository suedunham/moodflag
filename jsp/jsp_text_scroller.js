// ==PREPROCESSOR==
// @name "Scrolling Item Detail"
// @author "marc2003, Sue Dunham"
// @import "%fb2k_component_path%helpers.txt"
// @import "%fb2k_component_path%samples\js\lodash.min.js"
// @import "%fb2k_component_path%samples\js\common.js"
// ==/PREPROCESSOR==


// Modified from code originally found as part of the TripleQ theme.
// https://github.com/raphaelquast/foobar2000_TripleQ

var POINTS_TO_PIXELS = 4 / 3;

var colours = {
    text : 0,
    background : 0,
    highlight : 0,
};
var ColourTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
var ColourTypeDUI = {
    text: 0,
    background: 1,
    highlight: 2,
    selection: 3
};


update_colours();


var properties = {
    font: new _p('F2K.SCROLLER.FONT', 'Segoe UI'),
    font_size_max: new _p('F2K.SCROLLER.FONTSIZEMAX', 18),
    font_size_min: new _p('F2K.SCROLLER.FONTSIZEMIN', 6),
    left_tf: new _p('F2K.SCROLLER.LEFTTF', '[%artist% - ]'),
    right_tf: new _p('F2K.SCROLLER.RIGHTTF', '[%title%]'),
    scroll_delay: new _p('F2K.SCROLLER.DELAY', 30),
    gap: new _p('F2K.SCROLLER.GAP', 80),
    show_selected_when_stopped: new _p('F2K.SCROLLER.SHOWSTOPPED', false),
    color_left: new _p('F2K.SCROLLER.LEFTCOLOR', colours.text),
    color_right: new _p('F2K.SCROLLER.RIGHTCOLOR', colours.highlight),
    color_background: new _p('F2K.SCROLLER.BACKCOLOR', colours.background)
};
var timer_running = false;
var timer_increment = 0;
var interval_id = 0;
var left_tf = null;
var right_tf = null;
var all_tf = null;


compile_tf_strings();


function compile_tf_strings() {
    left_tf = fb.TitleFormat(properties.left_tf.value);
    right_tf = fb.TitleFormat(properties.right_tf.value);
    all_tf = fb.TitleFormat(properties.left_tf.value + properties.right_tf.value);
}


function get_track_info(tf) {
    // Get the track info from playing track (if playing) or selected track.
    if (fb.IsPlaying == true) {
        return tf.Eval();
    } else {
        if (properties.show_selected_when_stopped.enabled) {
            try {
                return tf.EvalWithMetadb(fb.GetFocusItem());
            } catch(e) {
                return '';
            }
        }
        return '';
    }
}


function on_mouse_rbtn_up(x, y) {
    var menu = window.CreatePopupMenu();
    var context = fb.CreateContextMenuManager();
    var color = window.CreatePopupMenu();
    menu.AppendMenuItem(MF_STRING, 1000, 'Font\u2026');
    menu.AppendMenuItem(MF_STRING, 1010, 'Max font size\u2026');
    menu.AppendMenuItem(MF_STRING, 1020, 'Min font size\u2026');
    menu.AppendMenuItem(MF_STRING, 1030, 'Left title-formatting string\u2026');
    menu.AppendMenuItem(MF_STRING, 1040, 'Right title-formatting string\u2026');
    menu.AppendMenuItem(MF_STRING, 1050, 'Scrolling delay\u2026');
    menu.AppendMenuItem(MF_STRING, 1060, 'Gap\u2026');
    menu.AppendMenuSeparator();
    color.AppendMenuItem(MF_STRING, 2000, 'Background\u2026');
    color.AppendMenuItem(MF_STRING, 2010, 'Left\u2026');
    color.AppendMenuItem(MF_STRING, 2020, 'Right\u2026');
    color.AppendTo(menu, MF_STRING, 'Colors');
    menu.AppendMenuSeparator();
    menu.AppendMenuItem(MF_STRING, 3000, 'Show selected when stopped');
    menu.CheckMenuItem(3000, properties.show_selected_when_stopped.enabled);
    menu.AppendMenuSeparator();
    menu.AppendMenuItem(MF_STRING, 10000, 'Reload panel');
    menu.AppendMenuItem(MF_STRING, 10010, 'Show properties\u2026');
    menu.AppendMenuItem(MF_STRING, 10020, 'Configure panel\u2026');
    var idx = menu.TrackPopupMenu(x, y);
    switch (idx) {
    case 0:
        break;
    case 1000:
        properties.font.value = utils.InputBox('Scrolling text panel font', 'Input property', properties.font.value);
        window.Repaint();
        break;
    case 1010:
        properties.font_size_max.value = utils.InputBox('Maximum font size', 'Input property', properties.font_size_max.value);
        window.Repaint();
        break;
    case 1020:
        properties.font_size_min.value = utils.InputBox('Minimum font size', 'Input property', properties.font_size_min.value);
        window.Repaint();
        break;
    case 1030:
        properties.left_tf.value = utils.InputBox('Title formatting pattern on the left', 'Input property', properties.left_tf.value);
        compile_tf_strings();
        reset_timer();
        window.Repaint();
        break;
    case 1040:
        properties.right_tf.value = utils.InputBox('Title formatting pattern on the right', 'Input property', properties.right_tf.value);
        compile_tf_strings();
        reset_timer();
        window.Repaint();
        break;
    case 1050:
        properties.scroll_delay.value = utils.InputBox('Scrolling delay (lower values for faster scrolling)', 'Input property', properties.scroll_delay.value);
        if (properties.scroll_delay.value < 1) {
            properties.scroll_delay.value = 1;
        }
        reset_timer();
        window.Repaint();
        break;
    case 1060:
        properties.gap.value = Number(utils.InputBox('Gap between full texts when scrolling', 'Input property', properties.gap.value));
        window.Repaint();
        break;
    case 2000:
        properties.color_background.value = utils.ColourPicker(properties.color_background.value);
        window.Repaint();
        break;
    case 2010:
        properties.color_left.value = utils.ColourPicker(properties.color_left.value);
        window.Repaint();
        break;
    case 2020:
        properties.color_right.value = utils.ColourPicker(properties.color_right.value);
        window.Repaint();
        break;
    case 3000:
        properties.show_selected_when_stopped.toggle();
        window.Repaint();
        break;
    case 10000:
        window.Reload();
        break;
    case 10010:
        window.ShowProperties();
        break;
    case 10020:
        window.ShowConfigure();
        break;
    default:
        context.ExecuteByID(idx - 1);
        break;
    }
    return true;
}


function on_paint(gr) {
    var all_tags = get_track_info(all_tf);
    var left_tags = get_track_info(left_tf);
    var right_tags = get_track_info(right_tf);
    var font = get_font(properties.font_size_max.value, all_tags)
    var all_dims = calc_text(all_tags, font, properties.font_size_max.value);
    var left_dims = calc_text(left_tags, font, properties.font_size_max.value);
    var right_dims = calc_text(right_tags, font, properties.font_size_max.value);
    var x_first = properties.gap.value / 2 - timer_increment;
    var x_next = all_dims.Width + properties.gap.value;
    var y = 0;
    var text_is_scrolled = (all_dims.Width > window.Width);
    var width = get_width();
    var text_alignment = get_text_alignment();

    gr.Clear(properties.color_background.value);
    if (text_is_scrolled) {
        draw_text(left_tags, properties.color_left.value, x_first);
        draw_text(left_tags, properties.color_left.value, x_first + x_next);
        draw_text(right_tags, properties.color_right.value, x_first + left_dims.Width);
        draw_text(right_tags, properties.color_right.value, x_first + left_dims.Width + x_next);
        if (timer_running == false) {
            interval_id = window.SetInterval(function () { draw_it(); }, properties.scroll_delay.value);
            timer_running = true;
        }
    } else {
        draw_text(left_tags, properties.color_left.value, -right_dims.Width / 2);
        draw_text(right_tags, properties.color_right.value, left_dims.Width / 2);
    }

    function calc_text(str, font, font_size) {  // , use_exact) {
        // Get text width and height with output like gr.MeasureString
        var w = utils.CalcTextWidth(str, font, font_size);  // , use_exact);
        var layout = utils.CreateTextLayout(str, font, font_size);
        var h = layout.CalcTextHeight(w);
        return {Width: w, Height: h};
    }

    function draw_it() {
        timer_increment = timer_increment % x_next;
        timer_increment += 1;
        window.Repaint();
    }

    function draw_text(tags, color, x) {
        gr.WriteText(tags, font, color, x, y, width, window.Height, text_alignment, DWRITE_PARAGRAPH_ALIGNMENT_CENTER);
    }

    function get_font(font_size, full_text) {
        // in case the window HEIGHT is too small, decrease font size
        // till a minimum is reached
        var temp = calc_text(full_text, properties.font.value, font_size);
        while (font_size > properties.font_size_min.value && (
               window.Height * .99 < temp.Height)) {
            font_size--;
            temp = calc_text(full_text, properties.font.value, font_size);
        }
        return CreateFontString(properties.font.value, font_size / POINTS_TO_PIXELS);
    }

    function get_text_alignment() {
        // Get WriteText text_alignment if scrolling or static.
        if (text_is_scrolled) {
            return DWRITE_TEXT_ALIGNMENT_LEADING;
        } else {
            return DWRITE_TEXT_ALIGNMENT_CENTER;
        }
    }

    function get_width() {
        if (text_is_scrolled) {
            return all_dims.Width;
        } else {
            return window.Width;
        }
    }
}


function on_playback_edited(handle) {
    reset_timer();
    window.Repaint();
}


function on_playback_new_track() {
    reset_timer();
    window.Repaint();
}


function on_size() {
    reset_timer();
}


function on_selection_changed() {
    if (fb.IsPlaying == false && fb.IsPaused == false) {
        reset_timer();
        window.Repaint()
    }
}


function reset_timer() {
    // reset moving text Interval on track-change
    if (timer_running == true){
        window.ClearInterval(interval_id)
        timer_increment = 0
        timer_running = false
    }
}


function update_colours() {
    if (window.IsDefaultUI) {
        colours.text = window.GetColourDUI(ColourTypeDUI.text);
        colours.highlight = window.GetColourDUI(ColourTypeDUI.highlight);
        colours.background = window.GetColourDUI(ColourTypeDUI.background);
    } else {
        colours.text = window.GetColourCUI(ColourTypeCUI.text);
        colours.highlight = window.GetColourCUI(ColourTypeCUI.text);
        colours.background = window.GetColourCUI(ColourTypeCUI.background);
    }
}
