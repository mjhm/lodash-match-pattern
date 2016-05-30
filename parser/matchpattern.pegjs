/*
 * JSON Grammar
 * ============
 *
 * Based on the grammar from RFC 7159 [1].
 *
 * Note that JSON is also specified in ECMA-262 [2], ECMA-404 [3], and on the
 * JSON website [4] (somewhat informally). The RFC seems the most authoritative
 * source, which is confirmed e.g. by [5].
 *
 * [1] http://tools.ietf.org/html/rfc7159
 * [2] http://www.ecma-international.org/publications/standards/Ecma-262.htm
 * [3] http://www.ecma-international.org/publications/standards/Ecma-404.htm
 * [4] http://json.org/
 * [5] https://www.tbray.org/ongoing/When/201x/2014/03/05/RFC7159-JSON
 */

/* ----- 2. JSON Grammar ----- */
{
  var mapApplyCount = 0;
}

JSON_text
  = ws value:value ws { return value; }

begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator = ws "," ws

ws "whitespace" = [ \t\n\r]*

/* ----- 3. Values ----- */

value
  = false
  / null
  / true
  / object
  / array
  / number
  / regex
  / string
  / matcher

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

/* ----- 4. Objects ----- */

object
  = begin_object
    members:(
      head:member
      tail:(value_separator m:member { return m; })*
      value_separator?
      subset:subset?
      {
        var result = {}, i;

        result[head.name] = head.value;

        for (i = 0; i < tail.length; i++) {
          result[tail[i].name] = tail[i].value;
        }
        if (subset) {
          result[subset] = '';
        }

        return result;
      }
    )?
    end_object
    { return members !== null ? members: {}; }

member
  = name:label name_separator value:value {
      return { name: name, value: value };
    }

/* ----- 5. Arrays ----- */

array
  = begin_array
    values:(
      head:value
      tail:(value_separator v:value { return v; })*
      value_separator?
      setMatch:setMatch?
      { return [head].concat(tail, setMatch || []); }
    )?
    end_array
    { return values !== null ? values : []; }

/* ----- 6. Numbers ----- */

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point = "."
digit1_9      = [1-9]
e             = [eE]
exp           = e (minus / plus)? DIGIT+
frac          = decimal_point DIGIT+
int           = zero / (digit1_9 DIGIT*)
minus         = "-"
plus          = "+"
zero          = "0"

/* ----- 7. Strings ----- */

string "quoted string" = dqstring / sqstring

regex "regex" = rqstring { return "__MP_regex " + text().slice(1, -1) }

dqstring "double quoted string"
  = dquotation_mark chars:dqchar* dquotation_mark { return chars.join(""); }

sqstring "single quoted string"
  = squotation_mark chars:sqchar* squotation_mark { return chars.join(""); }

rqstring "regex quoted string"
  = rquotation_mark chars:rqchar* rquotation_mark { return chars.join(""); }

dqchar
  = dqunescaped
  / escape
    sequence:('"' / no_quote_char)
    { return sequence; }

sqchar
  = squnescaped
  / escape
    sequence:("'" / no_quote_char)
    { return sequence; }

rqchar
  = rqunescaped
  / escape
    sequence:(no_quote_char)
    { return sequence; }

no_quote_char =
      "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }

escape         = "\\"
dquotation_mark = '"'
squotation_mark = "'"
rquotation_mark = "/"
dqunescaped      = [^\0-\x1F\x22\x5C]
squnescaped      = [^\0-\x1F\x27\x5C]
rqunescaped      = [^\0-\x1F\x2F\x5C]


/* ----- Core ABNF Rules ----- */

/* See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4627). */
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i

/* match pattern enhancements */

label = string / apply / map / soloApply / soloMap / identifier

identifier = alpha alphaNum* { return  text() }

apply = (applyPrefix dot alphaNum:alphaNum+ pipeArg:pipeArg*)
	{return "__MP_apply" + mapApplyCount++ + " " + alphaNum.concat(pipeArg).join("")}

soloApply = applyPrefix { return '__MP_apply' + mapApplyCount++  }
applyPrefix = "<-"

map = (mapPrefix dot alphaNum:alphaNum+ pipeArg:pipeArg*)
	{return "__MP_map" + mapApplyCount++ + " " + alphaNum.concat(pipeArg).join("")}

soloMap = mapPrefix { return '__MP_map' + mapApplyCount++ }
mapPrefix = "<="
dot = "."

subset = "..." { return "__MP_subset" }
superset = "^^^" { return "__MP_superset" }
equalset = "===" { return "__MP_equalset" }
setMatch = subset / superset / equalset

matcher
  = matcher:(isPrefix upper alphaNum* pipeArg*) {return "__MP_match " + text().slice(2)}

isPrefix = "_.is"
upper = [A-Z]
alpha = [a-zA-Z]
alphaNum = [_0-9a-zA-Z]
pipe = "|"
pipeArg = dqPipeArg / sqPipeArg / simplePipeArg
simplePipeArg = pipe [^|\"\'\n\r\t \}\,\:]* { return text() }
sqPipeArg = pipe squotation_mark [^|\n\r\']* squotation_mark {return text() }
dqPipeArg = pipe dquotation_mark [^|\n\r\"]* dquotation_mark {return text() }
